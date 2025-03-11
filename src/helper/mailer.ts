// let mailTransporter = nodemailer.createTransport({
// 	service: 'gmail',
// 	auth: {
// 		user: 'seoworld2022@gmail.com',
// 		pass: 'wdtnuojsodsihrkr'
// 	}
// });

import nodemailer from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/json-transport';
import { GetOneDocument } from '../connector/mongodb';
import { SMTP } from '../types/collection/smtp';
import { CollectionName } from '../types/mongoType';

export const sendMail = async (data: MailOptions): Promise<any> => {
  try {
    const smtp = (await GetOneDocument(CollectionName.SMTP, {}, {})) as SMTP;
    if (smtp && smtp.mode === 1) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: smtp.client,
          pass: smtp.secret,
        },
      });
      transporter.sendMail(data, (err, info) => {
        return { err, info };
      });
    } else {
      return { err: null, info: null };
    }
  } catch (err: any) {
    return { err, info: null };
  }
};
