import "dotenv/config";
import express from "express";
import cors from "cors";
import session, { SessionOptions } from "express-session";
import UserRoutes from "./Users/routes";
import MovieRoutes from "./Movies/routes";
import ReviewRoutes from "./Reviews/routes";
import ListRoutes from "./Lists/routes";
import mongoose from "mongoose";

mongoose.connect(process.env.DB_CONNECTION_STRING!);

const app = express();
app.use(
  cors({
    origin: process.env.ORIGIN_URL,
    credentials: true,
  })
);
app.use(express.json());

let sessionOptions: SessionOptions = {
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 * 365,
  },
};
if (process.env.NODE_ENV !== "development") {
  sessionOptions.proxy = true;
  sessionOptions.cookie = {
    sameSite: "none",
    secure: true,
    maxAge: 1000 * 60 * 60 * 24 * 365,
    domain: process.env.ORIGIN_URL,
  };
}
app.use(session(sessionOptions));

UserRoutes(app);
MovieRoutes(app);
ReviewRoutes(app);
ListRoutes(app);

app.get("/", (req, res) => {
  res.send("Welcome the the cinema center API");
});

app.listen(process.env.PORT);
console.log(`Server running at http://localhost:${process.env.PORT}`);
