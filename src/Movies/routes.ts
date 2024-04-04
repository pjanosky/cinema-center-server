import { Express } from "express";
import * as client from "../TMDB/client";
import * as reviewsClient from "../Reviews/client";

const MovieRoutes = (app: Express) => {
  app.get("/movie/:id", async (req, res) => {
    const { id } = req.params;
    const user = req.session.user;
    const [details, similar, reviews] = await Promise.all([
      client.moveDetails(id),
      client.similarMovies(id),
      reviewsClient.getReviewsForMovie(id),
    ]);

    res.send({
      ...details,
      similar: similar.slice(0, 5),
      reviews: reviews.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
      lists: [],
    });
  });
};
export default MovieRoutes;
