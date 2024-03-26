import cors from "cors";
import express from "express";
import HelloWorld from "./HelloWorld";

const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Welcome the the cinema center server!");
});
HelloWorld(app);
app.listen(process.env.PORT || 4000);
