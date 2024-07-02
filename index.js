import pg from "pg";
import bodyParser from "body-parser";
import express from "express";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  password: "gowtham2k2",
  host: "localhost",
  port: 5432,
  database: "routine_list",
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.post("/submit", (req, res) => {
  const time = req.body.userTime;
  console.log(time + "\n" + typeof time);
  res.redirect("/");
});

app.listen(port, () => {
  console.log("App is running on port: " + port);
});
