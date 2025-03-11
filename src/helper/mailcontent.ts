import { GetDocument, GetOneDocument } from '../connector/mongodb';
import { EmailTemplate } from '../types/collection/emailtemplate';
import { GENERAL } from '../types/collection/general';
import { CollectionName } from '../types/mongoType';
import { sendMail } from './mailer';

export const mailBuild = async (data: any): Promise<any> => {
  try {
    const settings = (await GetOneDocument(
      CollectionName.GENERAL,
      {},
      {}
    )) as GENERAL;
    const template = (await GetDocument(
      CollectionName.EmailTemplate,
      { name: data.template },
      {},
      {}
    )) as EmailTemplate[];
    let html = '';
    if (
      typeof template !== 'undefined' &&
      template.length > 0 /* && typeof settings != "undefined" */
    ) {
      html = html + template[0].content;
      for (let i = 0; i < data.html.length; i++) {
        const regExp = new RegExp(`{{${data.html[i].name}}}`, 'g');
        html = html.replace(regExp, data.html[i].value);
      }
      // html = html.replace(/{{privacy}}/g, `${settings.site_url}${settings.privacy_url ? settings.privacy_url : ''}`);
      // html = html.replace(/{{terms}}/g, `${settings.site_url}${settings.terms_url ? settings.terms_url : ''}`);
      // html = html.replace(/{{aboutus}}/g, `${settings.site_url}${settings.about_url ? settings.about_url : ''}`);
      html = html.replace(/{{site_url}}/g, settings.site_url);
      html = html.replace(/{{title}}/g, settings.title);
      // html = html.replace(/{{copy_rights}}/g, settings.copy_rights);

      let tomail: any = template[0].sender;
      if (Array.isArray(data.to) && template[0].receiver?.length) {
        tomail = [
          template[0].receiver?.split(',').map((s: string) => s.trim()),
        ];
        tomail = [...tomail, ...data.to];
        tomail = tomail.filter((e: string) => {
          return e;
        });
      } else if (data.to) {
        tomail = data.to;
      }
      let subject = template[0].subject;
      // subject = subject.replace(/{{privacy}}/g, `${settings.site_url}${settings.privacy_url ? settings.privacy_url : ''}`);
      // subject = subject.replace(/{{terms}}/g, `${settings.site_url}${settings.terms_url ? settings.terms_url : ''}`);
      // subject = subject.replace(/{{aboutus}}/g, `${settings.site_url}${settings.about_url ? settings.about_url : ''}`);
      subject = subject.replace(/{{title}}/g, settings.title);
      // subject = subject.replace(/{{title}}/g, settings.site_title);
      // subject = subject.replace(/{{copy_rights}}/g, settings.copy_rights);
      for (let i = 0; i < data.html.length; i++) {
        const regExp = new RegExp(`{{${data.html[i].name}}}`, 'g');
        subject = subject.replace(regExp, data.html[i].value);
      }

      const senderName = template[0].sender_name.replace(
        /{{title}}/g,
        settings.title
      );

      const mailOptions = {
        from: `${senderName} <${template[0].sender}>`,
        sender: template[0].sender,
        to: tomail,
        subject,
        text: html,
        html,
      };
      const respo = await sendMail(mailOptions);
      return respo;
    } else {
      return { err: null, info: null };
    }
  } catch (err) {
    return { err, info: null };
  }
};
