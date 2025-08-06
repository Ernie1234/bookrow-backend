import { Schema, model, Document, Types } from "mongoose";

export interface IBook extends Document {
  title: string;
  author: string;
  genre: string[];
  description: string;
  coverImage?: string;
  pages?: number;
  isAudiobook: boolean;
  audiobookUrl?: string;
  progress: number; // For tracking reading or listening progress (e.g., page number or timestamp)
  publishedDate?: Date;
  addedBy: Types.ObjectId; // Reference to the user who added the book
  readingPartners?: Types.ObjectId[]; // Array of user IDs for reading partners
  readingGroupId?: Types.ObjectId; // Reference to a reading group
}

const bookSchema = new Schema<IBook>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    genre: [
      {
        type: String,
        required: true,
      },
    ],
    description: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
      default: "https://placehold.co/300x400/000000/FFFFFF?text=Book",
    },
    pages: {
      type: Number,
    },
    isAudiobook: {
      type: Boolean,
      default: false,
    },
    audiobookUrl: {
      type: String,
    },
    progress: {
      type: Number,
      default: 0,
    },
    publishedDate: {
      type: Date,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    readingPartners: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    readingGroupId: {
      type: Schema.Types.ObjectId,
      ref: "ReadingGroup",
    },
  },
  {
    timestamps: true,
  }
);

const BookModel = model<IBook>("Book", bookSchema);
export default BookModel;
