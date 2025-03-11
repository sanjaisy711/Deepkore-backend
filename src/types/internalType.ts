export type MongoCB = (err?: Error) => void;
export interface MongoOption {
  maxPoolSize?: number;
  useNewUrlParser?: boolean;
  useUnifiedTopology?: boolean;
}

export interface Msg {
  message: string;
}

export enum statusCode {
  Success = 200,
  UnprocessableEntity = 422,
  InternalServer = 500,
  BadRequest = 400,
  PageNotFound = 404,
  Unauthorized = 401,
}

export enum Status {
  Active = 'active',
  Inactive = 'inactive',
  Archive = 'archive',
  Delete = 'delete',
}

export interface templateDetails {
  name: string;
  subject: string;
  content: string;
}

export enum PlanTypeName {
  TRIAL = 'Trial',
  PAID = 'Paid',
}

export interface CryptoReqRes {
  iv: string;
  content: string;
}
export enum UserRoleName {
  AccountOwner = 'Account Owner',
  SuperAdmin = 'Super Admin',
  UserAdmin = 'User Admin',
  BillingAdmin = 'Billing Admin',
  User = 'User',
}
