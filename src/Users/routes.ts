import { Express } from "express";
import users from "../Database/users";
import db from "../Database";
import authenticate from "../Account/authentication";
import { removingPassword } from "../Database/helpers";

const UserRoutes = (app: Express) => {
  app.get("/user/:id", async (req, res) => {
    const { id } = req.params;
    const user = users.find((user) => user._id === id);
    if (user) {
      res.send(user);
    } else {
      res.sendStatus(404);
    }
  });
  app.get("/user/:id/following", async (req, res) => {
    const { id } = req.params;
    const user = db.users.find((user) => user._id === id);
    if (!user) {
      res.sendStatus(404);
      return;
    }
    const users = user.following;
    const following = db.users
      .filter((user) => users.includes(user._id))
      .map((user) => removingPassword(user));
    res.send(following);
  });
  app.get("/user/:id/followers", async (req, res) => {
    const { id } = req.params;
    if (!db.users.find((user) => user._id === id)) {
      res.sendStatus(404);
      return;
    }
    const followers = db.users
      .filter((user) => user.following.includes(id))
      .map((user) => removingPassword(user));
    res.send(followers);
  });
  app.post("/user/:id/following/:followingId", async (req, res) => {
    const { id, followingId } = req.params;
    if (!authenticate(req, res, id)) {
      return;
    }
    db.users = db.users.map((user) => {
      if (user._id === id && !user.following.includes(followingId)) {
        const updatedFollowing = [...user.following, followingId];
        return {
          ...user,
          following: updatedFollowing,
        };
      } else {
        return user;
      }
    });
    res.sendStatus(200);
  });
  app.delete("/user/:id/following/:followingId", async (req, res) => {
    const { id, followingId } = req.params;
    if (!authenticate(req, res, id)) {
      return;
    }
    db.users = db.users.map((user) => {
      if (user._id === id) {
        const updatedFollowing = user.following.filter(
          (id) => id !== followingId
        );
        return {
          ...user,
          following: updatedFollowing,
        };
      } else {
        return user;
      }
    });
    res.sendStatus(200);
  });
};
export default UserRoutes;
