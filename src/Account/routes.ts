import db from "../Database";
import express from "express";
import { User } from "../Database/types";
import { removingPassword } from "../Database/helpers";

declare module "express-session" {
  interface SessionData {
    user: User;
  }
}

export default function AccountRoutes(app: express.Express) {
  app.post("/account/register", (req, res) => {
    const { name, email, username, password, role } = req.body;
    if (name == "") {
      res.status(400).send("Invalid name");
      return;
    } else if (email == "") {
      res.status(400).send("Invalid email");
      return;
    } else if (username == "") {
      res.status(400).send("Invalid username");
      return;
    } else if (password == "") {
      res.status(400).send("Invalid password");
      return;
    } else if (role !== "user" && role != "editor") {
      res.status(400).send("Invalid role");
      return;
    } else if (
      db.users.find((user) => user.username === username.toLowerCase())
    ) {
      res.status(400).send("Username is taken");
      return;
    } else if (db.users.find((user) => user.email === email)) {
      res.status(400).send("Email is already registered");
      return;
    } else {
      const newUser = {
        _id: crypto.randomUUID(),
        username: username.toLowerCase(),
        password,
        name,
        email,
        role,
        following: [],
      };
      req.session.user = newUser;
      db.users.push(newUser);
      res.send(removingPassword(newUser));
    }
  });
  app.post("/account/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.users.find(
      (user) => user.username === username && user.password === password
    );
    if (user) {
      req.session.user = user;
      res.send(removingPassword(user));
    } else {
      res.sendStatus(401);
    }
  });
  app.post("/account/logout", async (req, res) => {
    req.session.destroy((error) => {
      if (error) {
        res.sendStatus(500);
      } else {
        res.send("success");
      }
    });
  });
  app.get("/account/profile", (req, res) => {
    const currentUser = req.session.user;
    if (!currentUser) {
      res.sendStatus(401);
      return;
    }
    const user = db.users.find((user) => user._id === currentUser._id);
    res.send(user);
  });
  app.put("/account/profile", (req, res) => {
    const id = req.session.user?._id;
    if (!id) {
      res.sendStatus(401);
      return;
    }

    const { username, name, email } = req.body;
    if (name == "") {
      res.status(400).send("Invalid name");
      return;
    } else if (email == "") {
      res.status(400).send("Invalid email");
      return;
    } else if (username == "") {
      res.status(400).send("Invalid username");
      return;
    }

    db.users = db.users.map((user) => {
      if (user._id === id) {
        return {
          ...user,
          username,
          name,
          email,
        };
      } else {
        return user;
      }
    });
    const updatedUser = db.users.find((user) => user._id === id);
    if (updatedUser) {
      res.send(removingPassword(updatedUser));
    } else {
      res.status(400).send("User not found");
    }
  });
  app.put("/account/password", (req, res) => {
    const id = req.session.user?._id;
    if (!id) {
      res.sendStatus(401);
      return;
    }

    const { oldPassword, newPassword } = req.body;
    if (newPassword == "") {
      res.status(400).send("Invalid password");
      return;
    }

    let updatedUser: User | undefined = undefined;
    db.users = db.users.map((user) => {
      if (user._id !== id) {
        return user;
      }
      if (user.password !== oldPassword) {
        res.status(400).send("Incorrect password");
        updatedUser = user;
        return user;
      }
      updatedUser = { ...user, password: newPassword };
      res.send(removingPassword(updatedUser));
      return updatedUser;
    });
    if (!updatedUser) {
      res.status(400).send("User not found");
    }
  });
  app.delete("/account/profile", (req, res) => {
    const id = req.session.user?._id;
    if (!id) {
      res.sendStatus(401);
      return;
    }
    db.users = db.users.filter((user) => user._id !== id);
    req.session.destroy((error) => {
      if (error) {
        res.sendStatus(500);
      } else {
        res.send("success");
      }
    });
  });
}
