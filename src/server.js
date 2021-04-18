const express = require("express");
const routes = require("./routes")
const app = express();

//usando o template engine
app.set("view engine", "ejs");

//habilitar o req.body;
app.use(express.urlencoded( { extended: true }));

//habilitar arquivos statics
app.use(express.static("public"));
app.use(routes);

app.listen(3000, () => {
  console.log(`Server is listening on port ${3000}`)
})