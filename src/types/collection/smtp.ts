import { CommonFields } from './common';

export interface SMTP extends CommonFields {
  mode: number;
  client: string;
  secret: string;
}
