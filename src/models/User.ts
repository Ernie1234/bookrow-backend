import { Schema, model, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";

// Define a type for the user document with all properties.
// Mongoose will add _id and __v automatically.
export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password?: string;
  role: "USER" | "ADMIN";
  userImage?: string;
  googleId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  currentBook?: Types.ObjectId;
  readingGroups?: Types.ObjectId[];
  readingNotifications?: {
    bookId: Types.ObjectId;
    message: string;
    read: boolean;
    createdAt: Date;
    type: "schedule_reminder" | "chat_message" | "group_invite";
  }[];
}

// Create a Mongoose schema for the user
const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function (this: IUser) {
        // Password is only required if not using social login
        return !this.googleId;
      },
      minlength: 6,
    },
    userImage: {
      type: String,
      default: "https://placehold.co/400x400/000000/FFFFFF?text=User",
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    currentBook: {
      type: Schema.Types.ObjectId,
      ref: "Book",
    },
    readingGroups: [
      {
        type: Schema.Types.ObjectId,
        ref: "ReadingGroup",
      },
    ],
    readingNotifications: [
      {
        bookId: { type: Schema.Types.ObjectId, ref: "Book" },
        message: String,
        read: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
        type: {
          type: String,
          enum: ["schedule_reminder", "chat_message", "group_invite"],
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Mongoose middleware to hash the password before saving
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword: string) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// Export the Mongoose model
const UserModel = model<IUser>("User", userSchema);
export default UserModel;
