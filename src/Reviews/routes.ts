import { Express } from "express";
import { authenticatedUser } from "../Account/authentication";
import { Rating, Review } from "../Database/types";
import db from "../Database";

export default function ReviewRoutes(app: Express) {
  app.post("/reviews", async (req, res) => {
    const reviewInfo: {
      title: string;
      content: string;
      rating: Rating;
      movieId: string;
      userId: string;
    } = req.body;
    const user = authenticatedUser(req, res, reviewInfo.userId);
    if (!user) {
      return;
    }
    if (reviewInfo.title.length === 0) {
      res.status(400).send("Invalid title");
      return;
    } else if (reviewInfo.content.length === 0) {
      res.status(400).send("Invalid content");
      return;
    } else if (
      !reviewInfo.rating ||
      reviewInfo.rating < 1 ||
      reviewInfo.rating > 5
    ) {
      res.status(400).send("Invalid rating");
      return;
    } else if (!reviewInfo.movieId) {
      res.status(400).send("Invalid movieId");
      return;
    }

    const newReview: Review = {
      ...reviewInfo,
      _id: crypto.randomUUID(),
      likes: [],
      userId: user._id,
      date: new Date().toISOString().split("T")[0],
    };
    db.reviews = [...db.reviews, newReview];
    res.send(newReview);
  });
  app.put("/reviews/:id", async (req, res) => {
    const { id } = req.params;
    const reviewInfo: {
      title: string;
      content: string;
      rating: Rating;
    } = req.body;
    const user = authenticatedUser(req, res);
    if (!user) {
      return;
    }
    if (reviewInfo.title.length === 0) {
      res.status(400).send("Invalid title");
      return;
    } else if (reviewInfo.content.length === 0) {
      res.status(400).send("Invalid content");
      return;
    } else if (
      !reviewInfo.rating ||
      reviewInfo.rating < 1 ||
      reviewInfo.rating > 5
    ) {
      res.status(400).send("Invalid rating");
      return;
    }
    db.reviews = db.reviews.map((review) => {
      if (review._id !== id) {
        return review;
      }
      if (review.userId !== user._id) {
        res.status(401);
        throw new Error("unauthenticated");
      }
      return { ...review, ...reviewInfo };
    });
    const updatedReview = db.reviews.find((review) => review._id === id);
    res.send(updatedReview);
  });
  app.delete("/reviews/:id", async (req, res) => {
    const { id } = req.params;
    const user = authenticatedUser(req, res);
    if (!user) {
      return;
    }
    db.reviews = db.reviews.filter((review) => {
      if (review._id !== id) {
        return true;
      }
      if (review.userId !== user._id) {
        res.status(401);
        throw new Error("unauthenticated");
      }
      return false;
    });
    res.sendStatus(200);
  });
  app.post("/reviews/:reviewId/likes/:userId", async (req, res) => {
    const { reviewId, userId } = req.params;
    const user = authenticatedUser(req, res, userId);
    if (!user) {
      return;
    }
    db.reviews = db.reviews.map((review) => {
      if (review._id !== reviewId) {
        return review;
      }
      if (review.likes.includes(user._id)) {
        return review;
      }
      return {
        ...review,
        likes: [...review.likes, user._id],
      };
    });
    const updatedReview = db.reviews.find((review) => review._id === reviewId);
    res.send(updatedReview);
  });
  app.delete("/reviews/:reviewId/likes/:userId", async (req, res) => {
    const { reviewId, userId } = req.params;
    const user = authenticatedUser(req, res, userId);
    if (!user) {
      return;
    }
    db.reviews = db.reviews.map((review) => {
      if (review._id !== reviewId) {
        return review;
      }
      return {
        ...review,
        likes: review.likes.filter((id) => id !== user._id),
      };
    });
    const updatedReview = db.reviews.find((review) => review._id === reviewId);
    res.send(updatedReview);
  });
  app.get("/reviews/:reviewId/likes", async (req, res) => {
    const { reviewId } = req.params;
    const review = db.reviews.find((review) => review._id === reviewId);
    if (!review) {
      res.status(404).send("Review not found");
      return;
    }
    const users = review.likes
      .map((userId) => db.users.find((user) => user._id === userId))
      .filter((user) => user);
    res.send(users);
  });
}
