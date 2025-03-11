import {
  GetCount,
  InsertManyDocument,
  InsertOneDocument,
} from '../connector/mongodb';
import { CollectionName } from '../types/mongoType';
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';
import { DzitraUser } from '../types/collection/dzitrauser';
import ENV_PROP from '../config/config';
import _ from 'lodash';
import { PlanType } from '../types/collection/plan';
import { LeadStatus } from '../types/collection/lead';
import { IndustryType } from '../types/collection/industrytype';
import { GENERAL } from '../types/collection/general';
import { SMTP } from '../types/collection/smtp';
import { EmailTemplate } from '../types/collection/emailtemplate';
import { PlanTypeName, templateDetails } from '../types/internalType';
import EMAILTEMPLATE from './templateList';

const PLANTYPE = [PlanTypeName.TRIAL, PlanTypeName.PAID];
const INDUSTRYTYPE = ['IT1', 'IT2'];
const LEADSTATUS = [
  'New Request',
  'Assigned',
  'In Progress',
  'Demo Scheduled/Contacted',
  'Demo Completed',
  'Onboarded',
  'Not Interested',
  'Others',
];

export async function datacheck(): Promise<void> {
  // dzitra user
  const admincount = await GetCount(CollectionName.DzitraUser, {
    internalstatus: 1,
    externalstatus: 1,
  });
  if (!admincount && ENV_PROP?.EMAIL) {
    const userid = new ObjectId();
    const insertData: DzitraUser = {
      _id: userid,
      name: 'superadmin',
      display_name: 'Super Admin',
      email: ENV_PROP.EMAIL,
      hash: bcrypt.hashSync('dz!tr@dmin01', bcrypt.genSaltSync(10)),
      uq_id: `${CollectionName.DzitraUser}_${userid}`,
      internalstatus: 1,
      externalstatus: 1,
      recordstatus: 1,
      createdon: Date.now(),
      createdby: 0,
      modifiedon: Date.now(),
      modifiedby: 0,
    };
    await InsertOneDocument(CollectionName.DzitraUser, insertData);
  }

  // plan type
  const plantypecount = await GetCount(CollectionName.PlanType, {
    internalstatus: 1,
    externalstatus: 1,
  });
  if (!plantypecount) {
    const insertData: PlanType[] = _.map(PLANTYPE, newPlanTypes);
    await InsertManyDocument(CollectionName.PlanType, insertData);
  }

  // industry type
  const industrytypecount = await GetCount(CollectionName.IndustryType, {
    internalstatus: 1,
    externalstatus: 1,
  });
  if (!industrytypecount) {
    const insertData: IndustryType[] = _.map(INDUSTRYTYPE, newIndustryTypes);
    await InsertManyDocument(CollectionName.IndustryType, insertData);
  }

  // lead status
  const leadstatuscount = await GetCount(CollectionName.LeadStatus, {
    internalstatus: 1,
    externalstatus: 1,
  });
  if (!leadstatuscount) {
    const insertData: LeadStatus[] = _.map(LEADSTATUS, newLeadStatus);
    await InsertManyDocument(CollectionName.LeadStatus, insertData);
  }

  // general
  const generalcount = await GetCount(CollectionName.GENERAL, {
    internalstatus: 1,
    externalstatus: 1,
  });
  if (!generalcount) {
    const insertData: GENERAL = newGeneralSettings();
    await InsertOneDocument(CollectionName.GENERAL, insertData);
  }

  // smtp
  const smtpcount = await GetCount(CollectionName.SMTP, {
    internalstatus: 1,
    externalstatus: 1,
  });
  if (!smtpcount) {
    const insertData: SMTP = newSMTPSettings();
    await InsertOneDocument(CollectionName.SMTP, insertData);
  }

  // emailtemplate
  const templatecount = await GetCount(CollectionName.EmailTemplate, {
    internalstatus: 1,
    externalstatus: 1,
  });
  if (!templatecount) {
    const insertData: EmailTemplate[] = _.map(EMAILTEMPLATE, newEmailTemplates);
    await InsertManyDocument(CollectionName.EmailTemplate, insertData);
  }
}

function newPlanTypes(plantype: string): PlanType {
  return {
    name: plantype,
    description: `Initial insert plan type: ${plantype}`,
    internalstatus: 1,
    externalstatus: 1,
    recordstatus: 1,
    createdon: Date.now(),
    createdby: 0,
    modifiedon: Date.now(),
    modifiedby: 0,
  };
}

function newIndustryTypes(industrytype: string): IndustryType {
  return {
    industrytype,
    internalstatus: 1,
    externalstatus: 1,
    recordstatus: 1,
    createdon: Date.now(),
    createdby: 0,
    modifiedon: Date.now(),
    modifiedby: 0,
  };
}

function newLeadStatus(leadstatus: string): LeadStatus {
  return {
    name: leadstatus,
    description: `Initial insert lead status: ${leadstatus}`,
    internalstatus: 1,
    externalstatus: 1,
    recordstatus: 1,
    createdon: Date.now(),
    createdby: 0,
    modifiedon: Date.now(),
    modifiedby: 0,
  };
}

function newGeneralSettings(): GENERAL {
  return {
    title: ENV_PROP.TITLE,
    site_url: `https://${ENV_PROP.FE_HOST}:${ENV_PROP.FE_PORT}`,
    internalstatus: 1,
    externalstatus: 1,
    recordstatus: 1,
    createdon: Date.now(),
    createdby: 0,
    modifiedon: Date.now(),
    modifiedby: 0,
  };
}

function newSMTPSettings(): SMTP {
  return {
    client: 'seoworld2022@gmail.com',
    secret: 'wdtnuojsodsihrkr',
    mode: 1,
    internalstatus: 1,
    externalstatus: 1,
    recordstatus: 1,
    createdon: Date.now(),
    createdby: 0,
    modifiedon: Date.now(),
    modifiedby: 0,
  };
}

function newEmailTemplates(template: templateDetails): EmailTemplate {
  return {
    name: template.name,
    sender_name: '{{title}}',
    sender: 'info@dzitra.com',
    subject: template.subject,
    content: template.content,
    internalstatus: 1,
    externalstatus: 1,
    recordstatus: 1,
    createdon: Date.now(),
    createdby: 0,
    modifiedon: Date.now(),
    modifiedby: 0,
  };
}
