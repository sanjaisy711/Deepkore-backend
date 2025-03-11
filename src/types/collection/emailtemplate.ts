import { CommonFields } from './common';

export interface EmailTemplate extends CommonFields {
  name: string;
  sender_name: string;
  sender: string;
  subject: string;
  content: string;
  receiver?: string;
}
