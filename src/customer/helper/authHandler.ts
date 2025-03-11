import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthUserToken } from '../../types/responseType';
import ENV_PROP from '../../config/config';
import { statusCode } from '../../types/internalType';
import { ObjectId } from 'mongodb';

declare module 'express-serve-static-core' {
  interface Request {
    decoded?: AuthUserToken;
    context: { loginUserId: ObjectId };
  }
}

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
      ENV_PROP.CUSTOMER_SECRET_KEY,
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
    req.decoded?.sub === 'customer' &&
    req.decoded?.id?.toString() === req.headers?.userid?.toString()
  ) {
    next();
  } else {
    res
      .status(statusCode.Unauthorized)
      .json({ status: 0, message: 'Unauthorized Access' });
  }
};
