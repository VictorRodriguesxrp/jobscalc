const express = require("express");
const routes = express.Router();

//O EJS por padrão já busca os arquivos para renderizar na pasta chamada "view"
//No entanto, ele procura na pasta raiz, por isso criamos uma nova variavel apontando pra views do /src

const views = __dirname + "/views/"

const Profile = {
  data: {
    name: "Victor Rodrigues",
    avatar: "https://avatars.githubusercontent.com/u/64935593?v=4",
    "monthly-budget": 3000,
    "days-per-week": 5,
    "hours-per-day": 5,
    "vacation-per-year": 4,
    "value-hour": 75
  },

  controllers: {
    index(req, res) {
      res.render(views + "profile", { profile: Profile.data })
    },

    update(req, res) {
      
      // quantas horas por semana estou trabalhando
      // total de horas trabalhadas no mês
      const data = req.body;
      // definir quantas semanas tem em um ano
      const weeksPerYear = 52;
      // remover as semanas de férias do ano
      const weeksPerMonth = (weeksPerYear - data["vacation-per-year"]) / 12
      //horas trabalhadas na semana
      const weekTotalHours = data["hours-per-day"] * data["days-per-week"]
      //horas trabalhadas no mes
      const monthlyTotalHours = weekTotalHours * weeksPerMonth;
      //valor da hora
      const valueHour = data["monthly-budget"] / monthlyTotalHours;

      Profile.data = {
        ...Profile.data,
        ...req.body,
        "value-hour" : valueHour
      }
      return res.redirect("/profile")
    }
  }

}

const Job = {
  data: [
      {
        id: 1,
        name: "Pizzaria Guloso",
        "daily-hours": 2,
        "total-hours": 60,
        created_at: Date.now(),
      },
      {
        id: 2,
        name: "OneTwo project",
        "daily-hours": 3,
        "total-hours": 47,
        created_at: Date.now(),
      }
  ],

  controllers: {
    index(req, res) {
      const updatedJobs = Job.data.map((job) => {

        const remaining = Job.services.remainingDays(job);
        const status = remaining <= 0 ? 'done' : 'progress'

        return {
          ...job,
          remaining,
          status,
          budget: Job.services.calculateBudget(job, Profile.data["value-hour"])
        };
      })

      res.render(views + "index", { jobs: updatedJobs })
    },

    create(req, res) {
      return res.render(views + "job")
    },

    save(req, res) {
      const lastID = Job.data[Job.data.length - 1]?.id || 1;

      Job.data.push({
        id: lastID + 1,
        name: req.body.name,
        "daily-hours": req.body["daily-hours"],
        "total-hours": req.body["total-hours"],
        created_at: Date.now()
      });

      return res.redirect("/");
    },

    show(req, res) {
      const jobId = req.params.id;

      const job = Job.data.find(job => Number(job.id) === Number(jobId));

      if(!job) {
        return res.send("Job not found!")
      }

      job.budget = Job.services.calculateBudget(job, Profile.data["value-hour"]);

      return res.render(views + "job-edit", { job })
    },

    update(req, res) {
      const jobId = req.params.id;

      const job = Job.data.find(job => Number(job.id) === Number(jobId))

      if(!job) {
        return res.send("Job not found!")
      }

      const updatedJob = {
        ...job,
        name: req.body.name,
        "total-hours": req.body["total-hours"],
        "daily-hours": req.body["daily-hours"]
      }

      Job.data = Job.data.map(job => {
        
        if(Number(job.id) === Number(jobId)) {
          job = updatedJob
        }

        return job
      })

      res.redirect(`/job/${jobId}`)
    },

    delete(req, res) {
      const jobId = req.params.id

      Job.data = Job.data.filter(job => Number(job.id) !== Number(jobId))

      return res.redirect("/")
    }
  },

  services: {
    remainingDays(job) {
      //cálculo do tempo restante
      const remainingDays = (job["total-hours"] / job["daily-hours"]).toFixed();

      const createdDate = new Date(job.created_at);
      const dueDay = createdDate.getDate() + Number(remainingDays);
      const dueDateInMs = createdDate.setDate(dueDay);

      const timeDiffInMs = dueDateInMs - Date.now();

      //transformando em ms
      const dayInMs = 1000 * 60 * 60 * 24;
      const dayDiff = Math.floor(timeDiffInMs / dayInMs);

      //restam x dias para entregar o projeto.
      return dayDiff;
    },
    
    calculateBudget: (job, valueHour) => valueHour * job["total-hours"]
  }
}

routes.get("/", Job.controllers.index);

routes.get("/job", Job.controllers.create);
routes.get("/job/:id", Job.controllers.show);
routes.get("/profile", Profile.controllers.index);

routes.post("/job", Job.controllers.save);
routes.post("/job/:id", Job.controllers.update);
routes.post("/profile", Profile.controllers.update);


routes.post("/job/delete/:id", Job.controllers.delete);



module.exports = routes;