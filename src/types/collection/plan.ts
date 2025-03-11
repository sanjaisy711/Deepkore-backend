import { ObjectId } from 'mongodb';
import { CommonFields } from './common';

export interface Plan extends CommonFields {
  planname: string;
  usercount: number;
  dayscount: number;
  remainder1?: number;
  remainder2?: number;
  plantypeid?: ObjectId;
  price: number;
  days?: number;
  grace_period?: number;
  internal_name: string;
  uq_id?: string;
}

export interface PlanType extends CommonFields {
  name: string;
  description?: string;
}
