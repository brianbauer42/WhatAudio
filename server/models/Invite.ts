import { Document, Schema, Model, model} from "mongoose";

export interface IInvite {
  dateCreated: Date;
  generatedBy: string;
  claimedBy: string;
  code: string;
  note: string;
  wasClaimed: boolean;
};

export interface IInviteModel extends IInvite, Document {}

const InviteSchema = new Schema({
    dateCreated: { type: Date, default: Date.now },
    generatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    claimedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    code: { type: String, required: true },
    note: { type: String },
    wasClaimed: { type: Boolean, default: false }
});

export const Invite: Model<IInviteModel> = model<IInviteModel>('Invite', InviteSchema);