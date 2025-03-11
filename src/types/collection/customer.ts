import { ObjectId } from 'mongodb';
import { CommonFields } from './common';

// TODO: accountblock, address_id
export interface Customer extends CommonFields {
  onboarded_date: Date | number;
  subscription_validity: Date | number;
  remind_before: number;
  uq_id?: string;
  planid: ObjectId;
  purchase_id: string;
  dzitrauser_id: ObjectId;
  lead_id: ObjectId;
}
