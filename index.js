import pg from "pg";
import bodyParser from "body-parser";
import express from "express";
import bcrypt from "bcrypt";
import env from "dotenv";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";

const app = express();
const port = 3000;
const saltRounds = 10;
env.config();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60,
    },
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(passport.initialize());
app.use(passport.session());

const db = new pg.Client({
  user: process.env.PG_USER,
  password: process.env.PG_PWD,
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: process.env.PG_DATABASE,
});

db.connect();

let loginFlag = false;

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.post("/register", async (req, res) => {
  const newUser = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    userName: req.body.userName,
    email: req.body.email,
    enteredPassword: req.body.enteredPassword,
    reEnteredPassword: req.body.reEnteredPassword,
  };

  try {
    const isEmailExists = await db.query(
      "SELECT EXISTS( SELECT 1 FROM users WHERE email = $1)",
      [newUser.email]
    );
    // if email is not duplicate
    if (!isEmailExists.rows[0].exists) {
      const isUserNameExists = await db.query(
        "SELECT EXISTS( SELECT 1 FROM users WHERE user_name = $1)",
        [newUser.userName]
      );
      // if username already exist
      if (isUserNameExists.rows[0].exists) {
        res.render("index.ejs", {
          signUpError: true,
          registerAlert: "This User Name already Exists.",
          signUpData: newUser,
        });
      }
      // if username is suitable for new entry
      else {
        // if both entered and re-entered password are correct
        if (newUser.enteredPassword === newUser.reEnteredPassword) {
          bcrypt.hash(
            newUser.reEnteredPassword,
            saltRounds,
            async (err, hash) => {
              if (err) console.log(err);
              const result = await db.query(
                "INSERT INTO users(first_name, last_name, user_name, email, password) VALUES($1, $2, $3, $4, $5) RETURNING id, first_name, last_name, user_name, password;",
                [
                  newUser.firstName,
                  newUser.lastName,
                  newUser.userName,
                  newUser.email,
                  hash,
                ]
              );
              const user = result.rows[0];
              loginFlag = true;
              req.login(user, (err) => {
                res.redirect("/profile");
              });
            }
          );
        }
        // if both entered and re-entered password doesn't match
        else {
          res.render("index.ejs", {
            signUpError: true,
            registerAlert: "Re enter ther correct password.",
            signUpData: newUser,
          });
        }
      }
    }
    // if email is duplicate or already exist
    else {
      res.render("index.ejs", {
        signUpError: true,
        registerAlert: "Email already Exists.",
        signUpData: newUser,
      });
    }
  } catch (err) {
    console.log(err);
  }
});

// app.post("/login", (req, res) => {
//   passport.authenticate("local", (err, user) => {
//     console.log(user);
//     if (err) console.log(err);
//     if (!user)
//       return res.render("index.ejs", { loginError: true, loginAlert: err });
//     else return res.redirect("/profile");
//   })(req, res);
// });

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/",
  })
);

app.get("/logout", (req, res) => {
  res.redirect("/");
});

/////////////////////////////////--------- profile page section---------/////////////////////////////

app.get("/profile", async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const isListExits = await db.query(
        "SELECT EXISTS(SELECT 1 FROM todo_list WHERE user_id = $1);",
        [req.user.id]
      );

      if (isListExits.rows[0].exists) {
        const result = await db.query(
          "SELECT id, todo_title, time FROM todo_list WHERE user_id = $1 ORDER BY time ASC ;",
          [req.user.id]
        );

        res.render("profile.ejs", {
          user: req.user,
          data: result.rows,
          loginFlag: loginFlag,
        });
      } else {
        res.render("profile.ejs", { user: req.user, loginFlag: loginFlag });
      }
    } catch (err) {
      console.log(err);
    }
  } else {
    res.render("index.ejs", {
      loginError: true,
    });
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
    userId: parseInt(req.body.user_id),
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
// ----------------------------------------- end of profile section ------------------------- //

passport.use(
  new Strategy(async function verify(username, password, cb) {
    try {
      const isUserExists = await db.query(
        "SELECT EXISTS(SELECT 1 FROM users WHERE (user_name = $1 OR email = $1));",
        [username]
      );
      if (isUserExists.rows[0].exists) {
        const result = await db.query(
          "SELECT id, first_name, last_name, user_name, password FROM users WHERE (user_name = $1 OR email = $1);",
          [username]
        );
        const user = result.rows[0];
        bcrypt.compare(password, user.password, (err, result) => {
          if (err) {
            console.error("Error comparing passwords:", err);
            return cb(err);
          } else {
            if (result) {
              loginFlag = true;
              console.log("success!!");
              return cb(null, user);
            } else {
              return cb("Incorrect password", false);
            }
          }
        });
      } else {
        return cb("User not found", false);
      }
    } catch (err) {
      return cb(err);
    }
  })
);

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  cb(null, user);
});

app.listen(port, () => {
  console.log("App is running on port: " + port);
});
