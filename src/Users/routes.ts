import { Express } from "express";
import { authenticated } from "../authentication";
import * as dao from "./dao";
import * as reviewDao from "../Reviews/dao";
import * as listsDao from "../Lists/dao";
import { NewUser, User, isEditorUser, isWatcherUser } from "./types";

declare module "express-session" {
  interface SessionData {
    user: User | undefined;
  }
}

const UserRoutes = (app: Express) => {
  // User Routes
  app.get("/users/:userId", async (req, res) => {
    let { userId } = req.params;
    if (userId === "current") {
      if (!req.session.user) {
        res.sendStatus(401);
        return;
      }
      userId = req.session.user._id;
    }
    const user = await dao.findUserById(userId);
    if (user) {
      res.send(user);
    } else {
      res.sendStatus(404);
    }
  });

  app.get("/users", async (req, res) => {
    const { likedReview, query } = req.query;
    const review = likedReview
      ? await reviewDao.findReviewById(likedReview as string)
      : undefined;
    const users = await dao.findUsersByQuery({
      query: query as string | undefined,
      userIds: review?.likes || undefined,
    });
    res.send(users);
  });

  app.post("/users", async (req, res) => {
    const { name, email, username, password, role } = req.body;
    if (!name) {
      res.status(400).send("Invalid name");
      return;
    } else if (!email) {
      res.status(400).send("Invalid email");
      return;
    } else if (!username) {
      res.status(400).send("Invalid username");
      return;
    } else if (!password) {
      res.status(400).send("Invalid password");
      return;
    } else if (!["user", "editor"].includes(role)) {
      res.status(400).send("Invalid role");
      return;
    }
    const [duplicateUsername, duplicateEmail] = await Promise.all([
      dao.findUserByUsername(username),
      dao.findUserByEmail(email),
    ]);
    if (duplicateUsername) {
      res.status(400).send("Username is taken");
      return;
    } else if (duplicateEmail) {
      res.status(400).send("Email is taken");
      return;
    }

    const user: NewUser = {
      username: username.toLowerCase(),
      password,
      name,
      email: email.toLowerCase(),
      role,
      ...(role === "editor" ? { bio: "" } : { following: [] }),
    };
    const newUser = await dao.createUser(user);
    if (!newUser) {
      res.sendStatus(400);
      return;
    }
    req.session.user = newUser;
    res.send(newUser);
  });

  app.put("/users/:userId/information", async (req, res) => {
    const { userId } = req.params;
    if (!authenticated(req, userId)) {
      res.sendStatus(401);
      return;
    }

    const { username, name, email, bio } = req.body;
    if (!name) {
      res.status(400).send("Invalid name");
      return;
    } else if (!email) {
      res.status(400).send("Invalid email");
      return;
    } else if (!username) {
      res.status(400).send("Invalid username");
      return;
    }
    const [usernameUser, emailUser, user] = await Promise.all([
      dao.findUserByUsername(username),
      dao.findUserByEmail(email),
      dao.findUserById(userId),
    ]);
    if (!user) {
      res.send(404);
      return;
    }
    if (usernameUser && usernameUser._id !== userId) {
      res.status(400).send("Username is taken");
      return;
    } else if (emailUser && emailUser._id !== userId) {
      res.status(400).send("Email is taken");
      return;
    } else if (isEditorUser(user) && !bio) {
      res.status(400).send("Invalid bio");
      return;
    }
    const updatedUser: User = {
      ...user,
      username: username.toLowerCase(),
      name,
      email: email.toLowerCase(),
      ...(isEditorUser(user) ? { bio } : {}),
    };
    const success = await dao.updateUser(updatedUser);
    if (!success) {
      res.sendStatus(400);
      return;
    }
    res.send(updatedUser);
  });

  app.put("/users/:userId/password", async (req, res) => {
    const { userId } = req.params;
    if (!authenticated(req, userId)) {
      res.sendStatus(401);
      return;
    }

    const { oldPassword, newPassword } = req.body;
    if (!newPassword) {
      res.status(400).send("Invalid password");
      return;
    }
    if (!(await dao.findUserWithIdPassword(userId, oldPassword))) {
      res.sendStatus(401);
      return;
    }

    const success = await dao.updateUserPassword(userId, newPassword);
    if (!success) {
      res.sendStatus(400);
      return;
    }
    res.send("success");
  });

  app.delete("/users/:userId", async (req, res) => {
    const { userId } = req.params;
    if (!authenticated(req, userId)) {
      res.sendStatus(401);
      return;
    }
    const results = await Promise.all([
      dao.deleteUser(userId),
      dao.deleteFollower(userId),
      reviewDao.deleteReviewsByUserId(userId),
      listsDao.deleteListsByUserId(userId),
    ]);
    const success = results.every((result) => result);
    if (!success) {
      res.sendStatus(400);
      return;
    }
    res.send("success");
  });

  // Follower Routes
  app.get("/users/:userId/following", async (req, res) => {
    const { userId } = req.params;
    const user = await dao.findUserById(userId);
    if (!user) {
      res.sendStatus(404);
      return;
    }
    if (!isWatcherUser(user)) {
      res.sendStatus(400);
      return;
    }
    const following = await dao.findUsersByUserIds(user.following);
    res.send(following);
  });

  app.get("/users/:userId/followers", async (req, res) => {
    const { userId } = req.params;
    const followers = await dao.findUsersFollowing(userId);
    res.send(followers);
  });

  app.post("/users/:userId/following/", async (req, res) => {
    const { userId } = req.params;
    const { followingId } = req.body;
    if (!authenticated(req, userId)) {
      res.sendStatus(401);
      return;
    }
    const user = await dao.findUserById(userId);
    if (!user) {
      res.sendStatus(404);
      return;
    }

    if (!isWatcherUser(user)) {
      res.sendStatus(400);
      return;
    }
    const updatedUser: User = {
      ...user,
      following: [...user.following, followingId],
    };
    const success = await dao.updateUser(updatedUser);
    if (!success) {
      res.sendStatus(400);
      return;
    }
    res.send(followingId);
  });

  app.delete("/users/:userId/following/:followingId", async (req, res) => {
    const { userId, followingId } = req.params;
    if (!authenticated(req, userId)) {
      res.sendStatus(401);
      return;
    }
    const user = await dao.findUserById(userId);
    if (!user) {
      res.sendStatus(404);
      return;
    }
    if (!isWatcherUser(user)) {
      res.sendStatus(400);
      return;
    }
    const updatedUser: User = {
      ...user,
      following: user.following.filter((id) => id !== followingId),
    };
    const success = await dao.updateUser(updatedUser);
    if (!success) {
      res.sendStatus(400);
      return;
    }
    res.sendStatus(200);
  });

  // Account Routes
  app.post("/account/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await dao.findUserWithUsernamePassword(username, password);
    if (!user) {
      res.sendStatus(401);
      return;
    }
    req.session.user = user;
    res.send(user);
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
};
export default UserRoutes;
