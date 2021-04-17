const express = require("express");
const routes = express.Router();

//O EJS por padrão já busca os arquivos para renderizar na pasta chamada "view"
const path = require("path");

const views = __dirname + "/views/"

const profile = {
  name: "Victor Rodrigues",
  avatar: "https://avatars.githubusercontent.com/u/64935593?v=4",
  "monthly-budget": 3000,
  "days-per-week": 5,
  "hours-per-day": 5,
  "vacation-per-year": 4
}

console.log(profile["vacation-per-year"])

routes.get("/", (req, res) => res.render(views + "index"));
routes.get("/job", (req, res) => res.render(views + "job"));
routes.get("/job/edit", (req, res) => res.render(views + "job-edit"));
routes.get("/profile", (req, res) => res.render(views + "profile", { profile }));


module.exports = routes;