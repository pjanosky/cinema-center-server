import mongoose from "mongoose";

export type Rating = 1 | 2 | 3 | 4 | 5;

export type Review = {
  _id: string;
  date: string;
  rating: Rating;
  title: string;
  content: string;
  userId: string;
  movieId: string;
  likes: string[];
};

export type NewReview = {
  date: Date;
  rating: Rating;
  title: string;
  content: string;
  userId: string;
  movieId: string;
  likes: string[];
};

export type ReviewDocument = {
  _id: mongoose.Types.ObjectId;
  date: Date;
  rating: number;
  title: string;
  content: string;
  userId: mongoose.Types.ObjectId;
  movieId: string;
  likes: mongoose.Types.ObjectId[];
};
