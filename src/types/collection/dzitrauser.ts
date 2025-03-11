import { ObjectId } from 'mongodb';
import { CommonFields } from './common';

export interface DzitraUser extends CommonFields {
  _id: ObjectId;
  uq_id?: string;
  name: string;
  display_name?: string;
  email: string;
  hash?: string;
}

export interface DzitraUserRole extends CommonFields {
  dzitrauser_id: ObjectId;
  dzitrarole_id: ObjectId;
}
