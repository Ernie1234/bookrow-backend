// src/models/chatModel.ts
import { Schema, model, Document, Types } from "mongoose";

export interface IMessage {
  sender: Types.ObjectId;
  content: string;
  readBy: Types.ObjectId[];
  createdAt: Date;
}

export interface IChat extends Document {
  isGroupChat: boolean;
  chatName?: string;
  members: Types.ObjectId[];
  messages: IMessage[];
}

const messageSchema = new Schema<IMessage>(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, trim: true, required: true },
    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const chatSchema = new Schema<IChat>(
  {
    isGroupChat: { type: Boolean, default: false },
    chatName: { type: String, trim: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    messages: [messageSchema],
  },
  { timestamps: true }
);

const ChatModel = model<IChat>("Chat", chatSchema);
export default ChatModel;
