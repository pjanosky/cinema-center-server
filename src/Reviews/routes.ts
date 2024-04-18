import { Express } from "express";
import { authenticatedUser } from "../authentication";
import { NewReview } from "./types";
import * as dao from "./dao";
import * as usersDao from "../Users/dao";
import { SortOrder } from "mongoose";
import { isWatcherUser } from "../Users/types";

export default function ReviewRoutes(app: Express) {
  app.get("/reviews", async (req, res) => {
    const { userId, likedBy, movieId, followedBy, sort, order, limit } =
      req.query;

    let userIds: string[] | undefined = undefined;
    if (followedBy) {
      const user = await usersDao.findUserById(followedBy as string);
      if (!user) {
        res.sendStatus(404);
        return;
      }
      if (isWatcherUser(user)) {
        userIds = user?.following;
      }
    }

    const reviews = await dao.findReviewsByQuery({
      userId: userId as string,
      userIds: userIds,
      likedBy: likedBy as string,
      movieId: movieId as string,
      sort: sort as string,
      order: ["asc", "desc"].includes(order as string)
        ? (order as SortOrder)
        : undefined,
      limit: limit ? parseInt(limit as string) : 1000,
    });
    res.send(reviews);
  });

  app.post("/reviews", async (req, res) => {
    const { title, content, rating, movieId } = req.body;
    const user = authenticatedUser(req);
    if (!user) {
      res.sendStatus(401);
      return;
    }

    if (!title) {
      res.status(400).send("Invalid title");
      return;
    } else if (!content) {
      res.status(400).send("Invalid content");
      return;
    } else if (!rating || rating < 1 || rating > 5) {
      res.status(400).send("Invalid rating");
      return;
    }

    const newReview: NewReview = {
      title,
      content,
      rating,
      movieId,
      userId: user._id,
      likes: [],
      date: new Date(),
    };
    const createdReview = await dao.createReview(newReview);
    if (!createdReview) {
      res.sendStatus(400);
      return;
    }
    res.send(createdReview);
  });

  app.put("/reviews/:reviewId", async (req, res) => {
    const { reviewId } = req.params;
    const { title, content, rating } = req.body;

    const review = await dao.findReviewById(reviewId);
    if (!review) {
      res.sendStatus(404);
      return;
    }
    if (!authenticatedUser(req, review.userId)) {
      return;
    }

    const updatedReview = { ...review, title, content, rating };
    const success = await dao.updateReview(updatedReview);
    if (!success) {
      res.sendStatus(400);
      return;
    }
    res.send(updatedReview);
  });

  app.delete("/reviews/:reviewId", async (req, res) => {
    const { reviewId } = req.params;
    const review = await dao.findReviewById(reviewId);
    if (!review) {
      res.sendStatus(404);
      return;
    }
    if (!authenticatedUser(req, review.userId)) {
      return;
    }

    const success = await dao.deleteReview(reviewId);
    if (!success) {
      res.sendStatus(400);
      return;
    }
    res.sendStatus(200);
  });

  app.post("/reviews/:reviewId/likes", async (req, res) => {
    const { reviewId } = req.params;
    const { userId } = req.body;
    if (!authenticatedUser(req, userId)) {
      return;
    }
    const review = await dao.findReviewById(reviewId);
    if (!review) {
      res.sendStatus(404);
      return;
    }
    const updatedLikes = review.likes.includes(userId)
      ? review.likes
      : [...review.likes, userId];
    const updatedReview = { ...review, likes: updatedLikes };
    const success = await dao.updateReview(updatedReview);
    if (!success) {
      res.sendStatus(400);
      return;
    }
    res.send(updatedReview);
  });

  app.delete("/reviews/:reviewId/likes/:userId", async (req, res) => {
    const { reviewId, userId } = req.params;
    if (!authenticatedUser(req, userId)) {
      return;
    }
    const review = await dao.findReviewById(reviewId);
    if (!review) {
      res.sendStatus(404);
      return;
    }
    const updatedReview = {
      ...review,
      likes: review.likes.filter((like) => like !== userId),
    };
    const success = await dao.updateReview(updatedReview);
    if (!success) {
      res.sendStatus(400);
      return;
    }
    res.send(updatedReview);
  });
}
