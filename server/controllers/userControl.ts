import { User, IUserModel } from "./../models/User";
import { Request, Response } from "express";

// Find current user, then check that a user is logged in.
// (passport middleware creates req.user for logged in users)
export const read = (req: Request, res: Response) => {
  User.findById(req.params.id).exec((err: Error, result: IUserModel) => {
    if (err) {
      return res.send(err);
    }
    return res.send(result);
  });
};

export const getAll = (req: Request, res: Response) => {
  User.find(req.query).exec((err: Error, result: IUserModel[]) => {
    if (err) {
      res.send(err);
    }
    res.send(result);
  });
};

export const update = (req: Request, res: Response) => {
  User.findByIdAndUpdate(
    req.params.id,
    req.body,
    (err: Error, result: IUserModel | null) => {
      if (err) {
        return res.send(err);
      }
      return res.send(result);
    }
  );
};

export const remove = (req: Request, res: Response) => {
  User.findByIdAndRemove(
    req.params.id,
    req.body,
    (err: Error, result: IUserModel | null) => {
      if (err) {
        res.send(err);
      }
      res.send(result);
    }
  );
};
