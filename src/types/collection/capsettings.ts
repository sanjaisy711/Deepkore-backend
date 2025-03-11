import { ObjectId } from 'mongodb';
import { CommonFields } from './common';

export interface COMPANYSETTING extends CommonFields {
  accountname: string;
  accountdomain: string;
  accountowner: string;
  accountlogo: string;
  mobileappname: string;
  mobileapplogo: string;
  accounttheme: string;
  startingtime: string;
  closingtime: string;
  holidayflag?: boolean;
  holidayflagremainder: number;
  leadid: ObjectId;
}

export interface COMPANYFORMATSETTING extends CommonFields {
  accounttimezone: string;
  language: string;
  dateformat: string;
  numberformat: string;
  currencyformat: string;
  leadid: ObjectId;
}

export interface COMPANYWORKSETTING extends CommonFields {
  year: number;
  day: number;
  workstatus: boolean;
  leadid: ObjectId;
}

export interface COMPANYHOLIDAY extends CommonFields {
  companyworksettingid?: ObjectId;
  holidaydate: Date | number;
  description: string;
  leadid: ObjectId;
}
