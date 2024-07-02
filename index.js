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

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUser = {
  userId: 1,
  userName: "gowtham2k2",
  firstName: "Gowtham",
  lastName: "G",
};

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.post("/submit", (req, res) => {
  const time = req.body.userTime;
  console.log(time + "\n" + typeof time);
  res.redirect("/");
});

app.get("/profile", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, todo_title, time FROM todo_list WHERE user_id = $1 ORDER BY time ASC ;",
      [currentUser.userId]
    );
    console.log(result.rows);
    res.render("profile.ejs", {
      userName: currentUser.userName,
      data: result.rows,
    });
  } catch (err) {
    console.log(err);
  }
});

app.listen(port, () => {
  console.log("App is running on port: " + port);
});
