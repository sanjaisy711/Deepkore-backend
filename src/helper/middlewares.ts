import { NextFunction, Request, Response } from 'express';
import _ from 'lodash';
import { Status, statusCode } from '../types/internalType';

const validStatus = [
  Status.Active,
  Status.Inactive,
  Status.Archive,
  Status.Delete,
];
const validList = ['all', 'list'];
export const checkStatusandFor = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (
    _.includes(validStatus, req.params.status) &&
    (req.params.for === undefined || req.params.for === 'ext')
  ) {
    next();
  } else {
    res
      .status(statusCode.PageNotFound)
      .json({ status: 0, message: 'URL not found' });
  }
};
export const checkListStatus = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (_.includes([...validStatus, ...validList], req.params.list)) {
    next();
  } else {
    res
      .status(statusCode.PageNotFound)
      .json({ status: 0, message: 'URL not found' });
  }
};
