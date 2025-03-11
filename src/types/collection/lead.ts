import { ObjectId } from 'mongodb';
import { CommonFields } from './common';

export interface Lead extends CommonFields {
  name: string;
  business_email: string;
  mobile: string;
  country: string;
  industry_id: ObjectId;
  leadstatus_id?: ObjectId;
  uq_id: string;
  company_name: string;
  company_size: string;
  brief_business_requirement: string;
  source: string;
  recordstatus: number;
}

export interface LeadSignup extends CommonFields {
  name: string;
  business_email: string;
  mobile: string;
  company: string;
  industry_id: ObjectId;
  leadstatus_id?: ObjectId;
  uq_id: string;
  company_name: string;
  company_size: string;
  brief_business_requirement: string;
  source: string;
  recordstatus: number;
}

export interface LeadType extends CommonFields {
  name: string;
  description: string;
}

export interface LeadStatus extends CommonFields {
  name: string;
  description: string;
}

export interface LeadOwner extends CommonFields {
  lead_id: ObjectId;
  dzitrauser_id: ObjectId;
  leadstatus_id: ObjectId;
  comments: string;
  updateddate: Date | number;
}

export interface ScheduleDemo extends CommonFields {
  business_email: string;
  industry_id: ObjectId;
  leadstatus_id?: ObjectId;
  uq_id: string;
  company_name: string;
  company_size: string;
  brief_business_requirement: string;
  source: string;
  recordstatus: number;
}

export interface Plan extends CommonFields {
  name: string;
  business_email: string;
  mobile: string;
  company: string;
  plan: string;
  industry_id: ObjectId;
  leadstatus_id?: ObjectId;
  uq_id: string;
  company_name: string;
  company_size: string;
  brief_business_requirement: string;
  source: string;
  recordstatus: number;
}
export interface ContactUs extends CommonFields {
  name: string;
  business_email: string;
  mobile: string;
  country: string;
  company: string;
  industry_id: ObjectId;
  leadstatus_id?: ObjectId;
  uq_id: string;
  company_name: string;
  company_size: string;
  brief_business_requirement: string;
  source: string;
  recordstatus: number;
}
