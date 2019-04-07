import { Document, Schema, Model, model} from "mongoose";
import bcrypt from 'bcrypt-nodejs';
import { IPost } from './Post';
import { IInvite } from './Invite';

export interface IUser{
  id?: any; // I think it will always be a string, but must set to any to extend with Document model below.
  dateRegistered: Date;
  email: string;
  password: string;
  displayName: string;
  isAdmin: boolean;
  posts: IPost[];
  invites: IInvite[];
}

export interface IUserModel extends IUser, Document{
  generateHash(password: string): string;
  validPassword(password: string): boolean;
}


const userSchema = new Schema({
    dateRegistered: { type: Date, default: Date.now },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    displayName: { type: String, unique: true },
    isAdmin: { type: Boolean },
    posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    invites: [{ type: Schema.Types.ObjectId, ref: 'Invite' }]
});

// Encrypts password and salts it 10 times.
userSchema.methods.generateHash = function(password: string) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

// Compares the given password with the encrypted stored password.
userSchema.methods.validPassword = function(password: string) {
    return bcrypt.compareSync(password, this.password);
};

export const User: Model<IUserModel> = model<IUserModel>('User', userSchema);