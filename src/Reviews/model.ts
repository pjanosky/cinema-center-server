import mongoose from "mongoose";
import reviewSchema from "./schema";

const model = mongoose.model("ReviewModel", reviewSchema);
export default model;
