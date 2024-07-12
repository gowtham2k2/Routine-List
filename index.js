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
    res.render("profile.ejs", {
      user: currentUser,
      data: result.rows,
    });
  } catch (err) {
    console.log(err);
  }
});

app.post("/edit", async (req, res) => {
  const itemId = parseInt(req.body.updatedItemId);
  const itemTitle = req.body.updatedItemTitle;
  const updatedTime = req.body.editTime;
  try {
    await db.query(
      "UPDATE todo_list SET todo_title = $1, time = $2 WHERE id = $3;",
      [itemTitle, updatedTime, itemId]
    );
    res.redirect("/profile");
  } catch (err) {
    console.log(err);
  }
});

app.post("/delete", async (req, res) => {
  const itemId = req.body.deleteItemId;
  try {
    await db.query("DELETE FROM todo_list WHERE id = $1", [itemId]);
    res.redirect("/profile");
  } catch (err) {
    console.log(err);
  }
});

app.post("/add", async (req, res) => {
  const newList = {
    itemTitle: req.body.newItem,
    time: req.body.userTime,
    userId: parseInt(req.body.userId),
  };

  try {
    await db.query(
      "INSERT INTO todo_list(todo_title, time, user_id) VALUES($1, $2, $3);",
      [newList.itemTitle, newList.time, newList.userId]
    );
    res.redirect("/profile");
  } catch (err) {
    console.log(err);
  }
});

app.listen(port, () => {
  console.log("App is running on port: " + port);
});
