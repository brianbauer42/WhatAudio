import { Document, Schema, Model, model} from "mongoose";

export interface IPost {
  dateCreated: Date;
  dateEdited: Date;
  title: string;
  album: string;
  artist: string;
  postBody: string;
  audioUri: string;
  artUri: string;
  sharedBy: string;
};

export interface IPostModel extends IPost, Document{}

const Post = new Schema({
    dateCreated: { type: Date, default: Date.now },
    dateEdited: { type: Date },
    title: { type: String },
    album: { type: String },
    artist: { type: String },
    postBody: { type: String },
    audioUri: { type: String },
    artUri: { type: String },
    sharedBy: { type: Schema.Types.ObjectId, ref: 'User' }
});

Post.index({ title: 'text', album: 'text', artist: 'text', postBody: 'text'});

export const PostModel: Model<IPostModel> = model<IPostModel>('Post', Post);