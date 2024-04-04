import express from "express";
import { User } from "../Database/types";
import { SessionData } from "express-session";

export default function authenticate(
  req: express.Request,
  res: express.Response,
  id: string
): User | undefined {
  const user = req.session.user;
  if (user && user._id === id) {
    return user;
  }
  res.status(401).send("unauthenticated");
  return undefined;
}

export function authenticateUser(
  req: express.Request,
  res: express.Response,
  id: string
) {
  const user = authenticate(req, res, id);
  if (user && user.role != "user") {
    res.status(401).send("unauthenticated");
  }
}

export function authenticateEditor(
  req: express.Request,
  res: express.Response,
  id: string
) {
  const user = authenticate(req, res, id);
  if (user && user.role != "editor") {
    res.status(401).send("unauthenticated");
  }
}
