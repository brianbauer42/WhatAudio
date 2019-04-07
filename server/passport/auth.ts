import passport from 'passport';
import { Invite } from './../models/Invite';
import { config } from './../../server';
import { NextFunction, Request, Response } from "express";

export const verifyInviteCode = (req: Request, res: Response, next: NextFunction) => {
    const info = {
      err: false,
      message: ""
    };
    if (config.allowRegistrations === false) {
        info.err = true;
        info.message = "Registrations are disabled";
        return res.json(info);
    }
    if (config.openRegistrations) {
        return next();
    } 
    Invite.findOne({
        code: req.body.signup.inviteCode
    }).exec((err: Error, result) => {     // result is an Invite (can I use the model as a type?)
        if (err) {
            return res.send(err);
        }
        if (result && result.wasClaimed == false) {
            req.body.invite = result;
            next();
        } else {
            info.err = true;
            if (!result) {
                info.message = "Invalid invite code!";
            } else {
                info.message = "Invite code has already been used!";
            }
            res.json(info);
        }
    })
}

export const consumeInviteCode = (req: Request, res: Response, next: NextFunction) => {
    req.body.invite.wasClaimed = true;
    req.body.invite.claimedBy = req.user._id;
    req.body.invite.save((err: Error) => {
        if (err) {
            console.log(err);
        }
    });
}

export const registerNewUser = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('local-signup', function(err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            info.err = true;
            res.json(info);
        } else {
            req.logIn(user, function() {
                info.err = false;
                info.user = user;
                info.user.password = null;
                res.send(info);
                next();
            })
        }
    })(req, res, next);
}


export const loginExistingUser = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('local-login', function(err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            info.err = true;
            res.json(info);
        } else {
            req.logIn(user, function() {
                info.err = false;
                info.user = user;
                info.user.password = null;
                res.send(info);
            })
        }
    })(req, res, next);
}
    
export const requireLogin = (req: Request, res: Response, next: NextFunction) => {
    if (req.user) {
        next();
    } else {
        res.status(403);
        res.json({message: "You are not logged in!"});
    }
}

export const whoAmI = (req: Request, res: Response) => {
    if (!req.user) {
        return res.send();
    }
    req.user.password = null;
    res.send(req.user);
}