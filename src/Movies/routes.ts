import { Express } from "express";
import * as client from "../TMDB/client";
import * as reviewsDao from "../Reviews/dao";

const MovieRoutes = (app: Express) => {
  app.get("/movies", async (req, res) => {
    const { query } = req.query;
    const movies = await client.searchMovies((query as string).toLowerCase());
    res.send(movies);
  });

  app.get("/movies/:movieId", async (req, res) => {
    const { movieId } = req.params;
    const [details, cast, similar, reviews] = await Promise.all([
      client.moveDetails(movieId),
      client.movieCast(movieId),
      client.similarMovies(movieId),
      reviewsDao.findReviewsByMovieId(movieId),
    ]);
    if (!details) {
      res.sendStatus(500);
      return;
    }
    const stars =
      reviews.length > 0
        ? reviews.map((review) => review.rating).reduce((a, b) => a + b, 0) /
          reviews.length
        : undefined;

    const movieInfo = {
      ...details,
      similar: similar.slice(0, 10),
      cast: cast.toSorted((a, b) => a.order - b.order).slice(0, 10),
      stars,
    };
    res.send(movieInfo);
  });
};
export default MovieRoutes;
