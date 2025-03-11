import { CommonFields } from './common';

export interface DzitraRole extends CommonFields {
  name: string;
  description: string;
  uq_id?: string;
}
