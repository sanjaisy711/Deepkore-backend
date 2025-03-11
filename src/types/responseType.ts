import { ObjectId } from 'mongodb';
import { statusCode } from './internalType';

export interface AuthUserToken {
  id: ObjectId | string;
  username: string;
  sub: string;
  email?: string;
  time?: string;
  role?: string;
}
export interface AuthUser extends AuthUserToken {
  name: string;
  header: string;
}

export interface ReplyJSON {
  status: number;
  message: string;
  data?: any | any[];
}

export interface ReplySuccess {
  response: ReplyJSON;
  code: statusCode;
}

export interface PageData {
  total: number;
  totalPage: number;
  currentPage: number;
  size: number;
  currentSize: number;
}
