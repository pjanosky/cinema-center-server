import model from "./model";
import { NewReview, Rating, Review, ReviewDocument } from "./types";

function parseReview(document: ReviewDocument): Review {
  return {
    ...document,
    _id: document._id.toString(),
    rating: document.rating as Rating,
    userId: document.userId.toString(),
    likes: document.likes.map(toString),
    date: document.date.toISOString(),
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
  likedBy,
  movieId,
}: {
  userId: string | undefined;
  likedBy: string | undefined;
  movieId: string | undefined;
}): Promise<Review[]> {
  try {
    const documents = await model.find({
      $and: [
        ...(userId ? [{ userId }] : []),
        ...(likedBy ? [{ likes: likedBy }] : []),
        ...(movieId ? [{ movieId }] : []),
      ],
    });
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
