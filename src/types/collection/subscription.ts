import { ObjectId } from 'mongodb';
import { CommonFields } from './common';

export interface Subscription extends CommonFields {
  planid: ObjectId;
  customer_id?: ObjectId;
  startdate: Date | number;
  enddate: Date | number;
  maxenddate: Date | number;
  lead_id?: ObjectId;
  uq_id?: string;
}
