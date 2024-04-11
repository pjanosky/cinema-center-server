import mongoose from "mongoose";
import userSchema from "./schema";

const model = mongoose.model("UserModel", userSchema);
export default model;
