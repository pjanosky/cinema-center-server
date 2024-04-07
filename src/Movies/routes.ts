import { Express } from "express";
import * as client from "../TMDB/client";
import db from "../Database";

const MovieRoutes = (app: Express) => {
  app.get("/movie/:id", async (req, res) => {
    const { id } = req.params;
    const user = req.session.user;
    const [details, cast, similar] = await Promise.all([
      client.moveDetails(id),
      client.movieCast(id),
      client.similarMovies(id),
    ]);

    const movieInfo = {
      ...details,
      similar: similar.slice(0, 5),
      cast: cast.toSorted((a, b) => a.order - b.order).slice(0, 5),
    };
    res.send(movieInfo);
  });
  app.get("/movie/:id/reviews", async (req, res) => {
    const { id } = req.params;
    const reviews = db.reviews.filter((review) => review.movieId === id);
    res.send(reviews);
  });
};
export default MovieRoutes;
