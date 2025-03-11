import { ObjectId } from 'mongodb';
import { CommonFields } from './common';

export interface Role extends CommonFields {
  name: string;
  parentid?: ObjectId;
  leadid: ObjectId;
}
