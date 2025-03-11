import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import { CollectionName, UpdateOne } from '../types/mongoType';
import { UpdateOneDocument } from '../connector/mongodb';

export const createUserHash = async (
  {
    email,
    mobile,
    userid,
    leadid,
    customerid,
  }: {
    email: string;
    mobile: string;
    userid: ObjectId;
    leadid: ObjectId;
    customerid: ObjectId;
  },
  loginuserid: ObjectId | number,
  password?: string
): Promise<{ id: ObjectId }> => {
  try {
    const pass: string =
      password ??
      (process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'devLocal'
        ? 'test@123'
        : createPassword(10, true, true));
    const updateData = {
      email,
      mobile,
      hash: bcrypt.hashSync(pass, bcrypt.genSaltSync(10)),
      userid,
      leadid,
      ...(customerid && { customerid: new ObjectId(customerid) }),
      changepasswordflag: true,
      internalstatus: 1,
      externalstatus: 1,
      createdon: Date.now(),
      createdby: loginuserid,
      modifiedon: Date.now(),
      modifiedby: loginuserid,
    };
    const params = { $set: updateData };
    const { upsertedCount, modifiedCount }: UpdateOne = await UpdateOneDocument(
      CollectionName.UserCred,
      { userid: { $eq: userid } },
      params,
      { upsert: true }
    );
    if (upsertedCount || modifiedCount) {
      return { id: userid };
    } else {
      throw new Error('Error in creating user');
    }
  } catch (e) {
    throw new Error('Error in creating user');
  }
};

export const createPassword = (
  length: number,
  hasNumbers: boolean,
  hasSymbols: boolean
): string => {
  let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (hasNumbers) {
    chars += '0123456789';
  }
  if (hasSymbols) {
    chars += '!@#$*';
  }
  return generatePassword(length, chars);
};

const generatePassword = (length: number, chars: string): string => {
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};
