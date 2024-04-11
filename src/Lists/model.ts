import mongoose from "mongoose";
import listSchema from "./schema";

const model = mongoose.model("ListModel", listSchema);
export default model;
