import express from "express";

export function authenticated(
  req: express.Request,
  res: express.Response,
  id?: string
) {
  const user = req.session.user;
  if (!user || user._id !== id) {
    res.sendStatus(401);
    return undefined;
  }
  return user;
}

export function authenticatedUser(
  req: express.Request,
  res: express.Response,
  id?: string
) {
  const user = req.session.user;
  if (!user || user.role !== "user" || (id && id !== user._id)) {
    res.sendStatus(401);
    return undefined;
  }
  return user;
}

export function authenticatedEditor(
  req: express.Request,
  res: express.Response,
  id?: string
) {
  const user = req.session.user;
  if (!user || user.role !== "editor" || (id && id !== user._id)) {
    res.sendStatus(401);
    return undefined;
  }
  return user;
}
