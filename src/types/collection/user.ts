import { ObjectId } from 'mongodb';
import { CommonFields } from './common';

export interface User extends CommonFields {
  _id: ObjectId;
  firstname: string;
  middlename?: string;
  lastname?: string;
  displayname?: string;
  email: string;
  mobile: string;
  internalid?: ObjectId;
  lead_id: ObjectId;
  customer_id?: ObjectId;
  managerid?: ObjectId;
  usertypeid?: ObjectId;
  emailinvite?: boolean;
  twofaenrollment?: boolean;
  iv?: string;
}
export interface UserHash extends CommonFields {
  _id: ObjectId;
  userid: ObjectId;
  hash: string;
  leadid: ObjectId;
}

export interface UserRole extends CommonFields {
  userid: ObjectId;
  roleid: ObjectId;
  leadid: ObjectId;
}

export interface UserType extends CommonFields {
  name: string;
  description: string;
  leadid: ObjectId;
}
