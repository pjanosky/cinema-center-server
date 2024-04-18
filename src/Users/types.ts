import mongoose from "mongoose";

export type Role = "user" | "editor";

export type WatcherUser = {
  _id: string;
  username: string;
  name: string;
  email: string;
  role: "user";
  following: string[];
};

export type EditorUser = {
  _id: string;
  username: string;
  name: string;
  email: string;
  role: "editor";
  bio: string;
};

export type User = WatcherUser | EditorUser;

export function isEditorUser(user: User): user is EditorUser {
  return user.role === "editor";
}

export function isWatcherUser(user: User): user is WatcherUser {
  return user.role === "user";
}

export type UserDocument = {
  _id: mongoose.Types.ObjectId;
  username: string;
  password: string;
  name: string;
  email: string;
  role: Role;
  following?: mongoose.Types.ObjectId[] | null | undefined;
  bio?: string | undefined | null;
};

export type NewWatcherUser = {
  username: string;
  password: string;
  name: string;
  email: string;
  role: "user";
  following: string[];
};

export type NewEditorUser = {
  username: string;
  password: string;
  name: string;
  email: string;
  role: "editor";
  bio: string;
};

export type NewUser = NewWatcherUser | NewEditorUser;

export function isNewEditorUser(user: NewUser): user is NewEditorUser {
  return user.role === "editor";
}

export function isNewWatcherUser(user: NewUser): user is NewWatcherUser {
  return user.role === "user";
}
