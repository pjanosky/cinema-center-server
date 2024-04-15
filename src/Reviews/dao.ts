import { SortOrder } from "mongoose";
import model from "./model";
import { NewReview, Rating, Review, ReviewDocument } from "./types";

function parseReview(document: ReviewDocument): Review {
  return {
    _id: document._id.toString(),
    rating: document.rating as Rating,
    userId: document.userId.toString(),
    likes: document.likes.map((like) => like.toString()),
    date: document.date.toISOString(),
    title: document.title,
    content: document.content,
    movieId: document.movieId,
  };
}

export async function findReviewById(
  reviewId: string
): Promise<Review | undefined> {
  try {
    const document = await model.findById(reviewId);
    return document ? parseReview(document) : undefined;
  } catch {
    return undefined;
  }
}

export async function findReviewsByQuery({
  userId,
  userIds,
  likedBy,
  movieId,
  sort = "date",
  order = "desc",
  limit = 1000,
}: {
  userId: string | undefined;
  userIds: string[] | undefined;
  likedBy: string | undefined;
  movieId: string | undefined;
  sort: string | undefined;
  order: SortOrder | undefined;
  limit: number | undefined;
}): Promise<Review[]> {
  try {
    const documents = await model
      .find({
        $and: [
          {},
          ...(userId ? [{ userId }] : []),
          ...(userIds ? [{ userId: { $in: userIds } }] : []),
          ...(likedBy ? [{ likes: likedBy }] : []),
          ...(movieId ? [{ movieId }] : []),
        ],
      })
      .sort([[sort, order]])
      .limit(limit);
    return documents.map(parseReview);
  } catch {
    return [];
  }
}

export async function findReviewsByMovieId(movieId: string): Promise<Review[]> {
  try {
    const documents = await model.find({ movieId });
    return documents.map(parseReview);
  } catch {
    return [];
  }
}

export async function createReview(
  review: NewReview
): Promise<Review | undefined> {
  try {
    const document = await model.create(review);
    return parseReview(document);
  } catch {
    return undefined;
  }
}

export async function updateReview(review: Review): Promise<boolean> {
  try {
    const result = await model.updateOne({ _id: review._id }, { $set: review });
    return result.modifiedCount === 1;
  } catch {
    return false;
  }
}

export async function deleteReview(reviewId: string): Promise<boolean> {
  try {
    const result = await model.deleteOne({ _id: reviewId });
    return result.deletedCount === 1;
  } catch {
    return false;
  }
}

export async function deleteReviewsByUserId(userId: string): Promise<boolean> {
  try {
    const result = await model.deleteMany({ userId });
    return result.acknowledged;
  } catch {
    return false;
  }
}
