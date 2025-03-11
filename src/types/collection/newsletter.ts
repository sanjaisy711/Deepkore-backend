import { CommonFields } from './common';

export interface NewsLetter extends CommonFields {
  email: string;
  emailvalidated: boolean;
  optedout: boolean;
  is_lead: boolean;
  is_customer: boolean;
}
