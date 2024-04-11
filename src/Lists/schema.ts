import mongoose from "mongoose";

const listSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    entries: {
      type: [
        {
          movieId: { type: String, required: true },
          description: { type: String, required: true },
        },
      ],
      required: true,
      default: [],
    },
  },
  { collection: "lists" }
);

export default listSchema;
