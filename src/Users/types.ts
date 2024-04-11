import mongoose from "mongoose";

export type Role = "user" | "editor";

export type User = {
  _id: string;
  username: string;
  name: string;
  email: string;
  role: Role;
  following: string[];
};

export type UserDocument = {
  _id: mongoose.Types.ObjectId;
  username: string;
  password: string;
  name: string;
  email: string;
  role: Role;
  following: mongoose.Types.ObjectId[];
};

export type NewUser = {
  username: string;
  password: string;
  name: string;
  email: string;
  role: Role;
  following: string[];
};
