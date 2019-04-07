import { Request, Response } from "express";
import { PostModel, IPostModel } from './../models/Post';
import { User } from './../models/User';
import path from 'path';

export const create = (req: Request, res: Response) => {
  var newPost = new PostModel(req.fields);
  newPost.audioUri = req.user.displayName + '/' + path.basename(req.files.audio.path);
  if (req.files.art !== undefined) {
    newPost.artUri = req.user.displayName + '/' + path.basename(req.files.art.path);
  }
  newPost.sharedBy = req.user._id;
  newPost.save((err: Error, result: IPostModel) =>{
    if (err) {
      res.send(err);
    }
    User.update(
      { _id: req.user._id }, 
      { $push: { posts: result._id } }
    ).exec();
    res.send(result);
  });
};

export const search = (req: Request, res: Response) => {
  if (req.query.q === '') {
    return module.exports.getAll(req, res);
  }
  var queryString = req.query.q.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  PostModel.find({ $text : { $search : queryString } }).populate('sharedBy', 'displayName').exec((err: Error, result: IPostModel) => {
    if (err) {
      res.send(err);
    }
    res.send(result);
  });
};

export const read = (req: Request, res: Response) => {
  PostModel.findById(req.params.id).exec((err: Error, result: IPostModel) => {
    if (err) {
      return res.send(err);
    }
    res.send(result);
  });
};

export const getAll = (req: Request, res: Response) => {
  PostModel.find({}).populate('sharedBy', 'displayName').exec((err: Error, result: IPostModel) => {
    if (err) {
      res.send(err);
    }
    res.send(result);
  });
};

export const update = (req: Request, res: Response) => {
  req.body.dateEdited = Date.now();
  PostModel.findByIdAndUpdate(req.params.id, req.body, (err: Error, result: IPostModel) =>{
    if (err) {
      return res.send(err);
    }
    res.send(result);
  });
};

export const remove = (req: Request, res: Response) => {
  PostModel.findByIdAndRemove(req.params.id, (err: Error, result: IPostModel) =>{
    if (err) {
      res.send(err);
    }
    res.send(result);
  });
};
