import mongoose from "mongoose";

export type ListEntry = {
  movieId: string;
  description: string;
};

export type List = {
  _id: string;
  date: string;
  userId: string;
  title: string;
  description: string;
  entries: ListEntry[];
};

export type ListDocument = {
  _id: mongoose.Types.ObjectId;
  date: Date;
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  entries: {
    movieId: string;
    description: string;
  }[];
};

export type NewList = {
  date: string;
  userId: string;
  title: string;
  description: string;
  entries: ListEntry[];
};
