// src/models/readingGroupModel.ts
import { Schema, model, Document, Types } from "mongoose";

export interface IReadingGroup extends Document {
  name: string;
  book: Types.ObjectId;
  members: Types.ObjectId[];
  chatId: Types.ObjectId;
  schedule?: {
    day: string;
    time: string;
    reminder: boolean;
  }[];
}

const readingGroupSchema = new Schema<IReadingGroup>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    book: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    schedule: [
      {
        day: { type: String, required: true },
        time: { type: String, required: true },
        reminder: { type: Boolean, default: false },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const ReadingGroupModel = model<IReadingGroup>(
  "ReadingGroup",
  readingGroupSchema
);
export default ReadingGroupModel;
