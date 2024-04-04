import { Express } from "express";
import * as tmbd from "../TMDB/client";
import db from "../Database/index";
import { removingPassword } from "../Database/helpers";

const SearchRoutes = (app: Express) => {
  app.get("/search/movies", async (req, res) => {
    const { query } = req.query;
    const term = (query as string).toLowerCase();
    const movies = await tmbd.searchMovies(term);
    res.send(movies);
  });
  app.get("/search/users", (req, res) => {
    const { query } = req.query;
    const term = (query as string).toLowerCase();
    const users = db.users
      .filter(
        (users) =>
          users.name.toLowerCase().includes(term) ||
          users.username.toLowerCase().includes(term)
      )
      .slice(0, 30)
      .map((user) => removingPassword(user));
    res.send(users);
  });
};
export default SearchRoutes;
