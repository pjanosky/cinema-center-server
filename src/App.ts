// const express = require("express");
import express from "express";
import cors from "cors";
import session from "express-session";
import AccountRoutes from "./Account/routes";
import "dotenv/config";
import UserRoutes from "./Users/routes";
import SearchRoutes from "./Search/routes";
import MovieRoutes from "./Movies/routes";

const app = express();
app.use(
  cors({
    origin: process.env.CINEMA_CENTER_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

AccountRoutes(app);
UserRoutes(app);
SearchRoutes(app);
MovieRoutes(app);

app.get("/", (req, res) => {
  res.send("Welcome the the cinema center server!");
});

app.listen(process.env.PORT || 4000);
