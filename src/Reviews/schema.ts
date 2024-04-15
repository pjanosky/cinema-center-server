import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    rating: { type: Number, required: true, enum: [1, 2, 3, 4, 5] },
    title: { type: String, required: true },
    content: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      required: true,
    },
    movieId: { type: String, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserModel" }],
  },
  { collection: "reviews" }
);
export default reviewSchema;
