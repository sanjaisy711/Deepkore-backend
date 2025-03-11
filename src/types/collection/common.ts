import { ObjectId } from 'mongodb';

export interface CommonFields {
  _id?: ObjectId;
  internalstatus?: number;
  externalstatus?: number;
  recordstatus?: number;
  createdon?: Date | number;
  createdby?: ObjectId | number;
  modifiedon?: Date | number;
  modifiedby?: ObjectId | number;
  createdAt?: Date | number;
  updatedAt?: Date | number;
}
