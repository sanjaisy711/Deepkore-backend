import { NextFunction, Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { GetOneDocument } from '../../connector/mongodb';
import { Role } from '../../types/collection/role';
import { User, UserRole } from '../../types/collection/user';
import { statusCode, UserRoleName } from '../../types/internalType';
import { CollectionName } from '../../types/mongoType';
import jwt from 'jsonwebtoken';
import ENV_PROP from '../../config/config';
import { decrypt } from '../../helper/cryptoHelper';
import _ from 'lodash';

const capAllowedRoles = [UserRoleName.AccountOwner, UserRoleName.SuperAdmin];

export async function checkUserRole(
  id: ObjectId
): Promise<UserRoleName | boolean> {
  const userrole = (await GetOneDocument(
    CollectionName.UserRole,
    { userid: new ObjectId(id), internalstatus: 1, externalstatus: 1 },
    { roleid: 1 }
  )) as UserRole;
  if (!userrole?.roleid) {
    return false;
  }
  const role = (await GetOneDocument(
    CollectionName.Role,
    { _id: new ObjectId(userrole.roleid) },
    { name: 1 }
  )) as Role;
  if (!role?.name || !_.includes(capAllowedRoles, role.name)) {
    return false;
  }
  return role.name as UserRoleName;
}

export const capEnsureAuthorized = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token: string = req.headers.authorization ?? '';
  if (token) {
    jwt.verify(
      token,
      ENV_PROP.CAP_SECRET_KEY,
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
export const capIsUserValid = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (
    req.decoded?.sub === 'cap' &&
    req.decoded?.id?.toString() === req.headers?.userid?.toString() &&
    req.decoded?.time
  ) {
    GetOneDocument(
      CollectionName.User,
      {
        _id: { $eq: new ObjectId(req.headers?.userid as string) },
        internalstatus: 1,
        externalstatus: 1,
      },
      { _id: 1, iv: 1, lead_id: 1 }
    )
      .then((user: User) => {
        if (!user?._id || !user?.iv) {
          res
            .status(statusCode.Unauthorized)
            .json({ status: 0, message: 'Unauthorized Access' });
        } else {
          const time = decrypt({
            iv: user.iv,
            content: req.decoded?.time as string,
          });
          const role = decrypt({
            iv: user.iv,
            content: req.decoded?.role as string,
          });
          if (!_.includes(capAllowedRoles, role)) {
            res
              .status(statusCode.Unauthorized)
              .json({ status: 3, message: 'Account has no access.' });
          } else {
            if (Number(time) <= Date.now()) {
              res
                .status(statusCode.Unauthorized)
                .json({ status: 3, message: 'Account plan expired.' });
            } else {
              req.capcontext = {
                loginUserId: new ObjectId(req.headers.userid as string),
                leadid: new ObjectId(user.lead_id),
              };
              next();
            }
          }
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
