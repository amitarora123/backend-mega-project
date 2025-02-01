import mongoose, { Schema } from "mongoose";

const tweetsSchema = Schema(
  {
    content: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Tweets = mongoose.model("Likes", tweetsSchema);
