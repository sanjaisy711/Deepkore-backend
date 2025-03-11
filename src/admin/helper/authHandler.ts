import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import ENV_PROP from '../../config/config';
import { statusCode } from '../../types/internalType';
import { ObjectId } from 'mongodb';
import { GetOneDocument } from '../../connector/mongodb';
import { CollectionName } from '../../types/mongoType';
import { DzitraUser } from '../../types/collection/dzitrauser';

export const isSupportAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    if (req.isAuthenticated()) {
      next();
      return;
    } else {
      res
        .status(statusCode.Unauthorized)
        .json({ status: 0, message: 'Unauthorized Access' });
    }
  } catch (ex) {
    console.error('Signin authenticate error', ex);
  }
};
export const ensureAuthorized = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token: string = req.headers.authorization ?? '';
  if (token) {
    jwt.verify(
      token,
      ENV_PROP.ADMIN_SECRET_KEY,
      (err: any, decoded: any): void => {
        if (err) {
          res
            .status(statusCode.Unauthorized)
            .json({ status: 0, message: 'Unauthorized Access' });
        } else {
          req.decoded = decoded;
          next();
        }
      }
    );
  } else {
    res
      .status(statusCode.Unauthorized)
      .json({ status: 0, message: 'Unauthorized Access' });
  }
};
export const isUserValid = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (
    req.decoded?.sub === 'admin' &&
    req.decoded?.id?.toString() === req.headers?.userid?.toString()
  ) {
    GetOneDocument(
      CollectionName.DzitraUser,
      {
        _id: { $eq: new ObjectId(req.headers?.userid as string) },
        internalstatus: 1,
        externalstatus: 1,
      },
      { _id: 1 }
    )
      .then((user: DzitraUser) => {
        if (!user?._id) {
          res
            .status(statusCode.Unauthorized)
            .json({ status: 0, message: 'Unauthorized Access' });
        } else {
          next();
        }
      })
      .catch((e) => {
        res
          .status(statusCode.Unauthorized)
          .json({ status: 0, message: 'Unauthorized Access' });
      });
  } else {
    res
      .status(statusCode.Unauthorized)
      .json({ status: 0, message: 'Unauthorized Access' });
  }
};
