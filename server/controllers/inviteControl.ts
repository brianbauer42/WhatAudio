import crypto from "crypto";
import { Request, Response } from "express";
import { Invite, IInviteModel } from "./../models/Invite";
import { User } from "./../models/User";

export const create = (req: Request, res: Response) => {
  var newCode = new Invite();
  newCode.generatedBy = req.user._id;
  newCode.note = req.body.note;
  newCode.code = crypto.randomBytes(16).toString("hex");
  newCode.save((err: Error, result: IInviteModel) => {
    if (err) {
      return res.send(err);
    }
    return User.update(
      { _id: req.user._id },
      { $push: { invites: result._id } },
      () => {
        return res.send(result);
      }
    );
  });
};

export const readMine = (req: Request, res: Response) => {
  Invite.find({
    generatedBy: req.user._id
  })
    .populate("claimedBy")
    .exec((err: Error, result: IInviteModel) => {
      if (err) {
        return res.send(err);
      }
      return res.send(result);
    });
};
