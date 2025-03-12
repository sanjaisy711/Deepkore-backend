import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import { AuthUserToken } from '../types/responseType';
import { sign } from 'jsonwebtoken';
import { Msg, Status } from '../types/internalType';
import { CollectionName, UpdateMany } from '../types/mongoType';
import { UpdateManyDocument } from '../connector/mongodb';

declare module 'express-serve-static-core' {
  interface Request {
    decoded?: AuthUserToken;
    context: {
      loginUserId: ObjectId;
    };
    capcontext: {
      leadid: ObjectId;
      loginUserId: ObjectId;
    };
  }
}

export const isObjectId = (id: string | ObjectId): boolean => {
  return ObjectId.isValid(id);
};

export const validPassword = (password: string, passwordb: string): boolean => {
  return !bcrypt.compareSync(password, passwordb);
};

export const jwtSigninToken = (
  payload: AuthUserToken,
  secret: string,
  expiry: string | number
): string => {
  if (typeof expiry === 'number') {
    expiry = `${expiry}s`; // Convert numeric expiry to string format (e.g., "3600s")
  }

  return sign(payload, secret, {
    expiresIn: expiry as string, // Ensure it's always a valid string
  });
};

export const getMatchStatus = (status: string): number[] => {
  let value;
  switch (status) {
    case 'all':
      value = [1, 0, -1, -2];
      break;
    case Status.Active:
      value = [1];
      break;
    case Status.Inactive:
      value = [0];
      break;
    case Status.Archive:
      value = [-1];
      break;
    case Status.Delete:
      value = [-2];
      break;
    default:
      value = [0, 1];
      break;
  }
  return value;
};

export const getStatusValue = (status: string): number => {
  let value;
  switch (status) {
    case Status.Inactive:
      value = 0;
      break;
    case Status.Archive:
      value = -1;
      break;
    case Status.Delete:
      value = -2;
      break;
    default:
      value = 1;
      break;
  }
  return value;
};

export const updateStatus = async (
  collection: CollectionName,
  query: any,
  params: any,
  option: any
): Promise<Msg> => {
  const { modifiedCount }: UpdateMany = await UpdateManyDocument(
    collection,
    query,
    params,
    option
  );
  if (!modifiedCount) {
    throw new Error('Internal collection update error');
  } else {
    return { message: 'Updated successfully' };
  }
};
