import { ObjectId } from 'mongodb';

export interface InsertOne {
  insertedId: ObjectId;
  acknowledged: boolean;
}

export interface InsertMany {
  insertedCount: number;
  acknowledged: boolean;
}

export interface UpdateMany {
  modifiedCount: number;
  acknowledged: boolean;
  matchedCount: number;
}
export interface UpdateOne {
  modifiedCount: number;
  upsertedCount: number;
  acknowledged: boolean;
  matchedCount: number;
  upsertedId: ObjectId;
}

export interface GetDocExt {
  sort?: Record<string, string | number>;
  skip?: number;
  limit?: number;
}

export enum CollectionName {
  DzitraUser = 'dzitrauser',
  DzitraRole = 'dzitrarole',
  DzitraUserRole = 'dzitrauserrole',
  User = 'user',
  Role = 'role',
  UserCred = 'usercredential',
  UserRole = 'userrole',
  NewsLetter = 'newsletter',
  Lead = 'lead',
  LeadType = 'leadtype',
  LeadStatus = 'leadstatus',
  LeadOwner = 'leadowner',
  UserType = 'usertype',
  IndustryType = 'industrytype',
  Region = 'region',
  Plan = 'plan',
  PlanType = 'plantype',
  Subscription = 'subscription',
  Customer = 'customer',
  EmailTemplate = 'emailtemplate',
  SMTP = 'smtp',
  GENERAL = 'general',
  COMPANYSETTING = 'companysetting',
  COMPANYFORMATSETTING = 'companyformatsetting',
  COMPANYWORKSETTING = 'companyworksetting',
  COMPANYHOLIDAY = 'companyholiday',
}
