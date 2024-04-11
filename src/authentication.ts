import express from "express";

export function authenticated(req: express.Request, id?: string) {
  const user = req.session.user;
  if (!user || user._id !== id) {
    return undefined;
  }
  return user;
}

export function authenticatedUser(req: express.Request, id?: string) {
  const user = req.session.user;
  if (!user || user.role !== "user" || (id && id !== user._id)) {
    return undefined;
  }
  return user;
}

export function authenticatedEditor(req: express.Request, id?: string) {
  const user = req.session.user;
  if (!user || user.role !== "editor" || (id && id !== user._id)) {
    return undefined;
  }
  return user;
}
