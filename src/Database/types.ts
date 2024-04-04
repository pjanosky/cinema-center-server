export type Role = "user" | "editor";
export type Review = {
  date: string;
};
export type List = {};
export type User = {
  _id: string;
  username: string;
  password?: string;
  name: string;
  email: string;
  role: Role;
  following: String[];
};
