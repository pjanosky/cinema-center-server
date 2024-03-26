import express from "express";

export default function HelloWorld(app: express.Express) {
  app.get("/hello", (req, res) => {
    res.send("Hello World!");
  });
}
