import { CommonFields } from './common';

export interface Region extends CommonFields {
  name: string;
  description?: string;
}
