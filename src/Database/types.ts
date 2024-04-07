export type Role = "user" | "editor";
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
export type List = {
  _id: string;
  date: string;
  userId: string;
  title: string;
  description: string;
  movies: {
    movieId: string;
    description: string;
  }[];
};
export type User = {
  _id: string;
  username: string;
  password?: string;
  name: string;
  email: string;
  role: Role;
  following: String[];
};
