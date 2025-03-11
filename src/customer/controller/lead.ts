import { Request } from 'express';
import { validationResult } from 'express-validator';
import { ObjectId } from 'mongodb';
import {
  DeleteOneDocument,
  GetOneDocument,
  UpdateOneDocument,
  InsertOneDocument,
} from '../../connector/mongodb';
import { InsertOne } from '../../types/mongoType';
import { createUserHash } from '../../helper/hashHelper';
import { Lead, LeadSignup, ScheduleDemo, Plan, ContactUs } from '../../types/collection/lead';
import { User } from '../../types/collection/user';
import { statusCode } from '../../types/internalType';
import { CollectionName, UpdateOne } from '../../types/mongoType';
import { AuthUserToken, ReplySuccess } from '../../types/responseType';
import { newLead } from '../../admin/controller/lead';

export const checkLinkExpiry = async (req: Request): Promise<ReplySuccess> => {
  if ((await tokenCheck(req.decoded)).valid) {
    return {
      code: statusCode.Success,
      response: {
        status: 1,
        message: 'Valid Link',
      },
    };
  } else {
    return {
      code: statusCode.Unauthorized,
      response: { status: 0, message: 'Unauthorized Access' },
    };
  }
};

export const inviteSubmit = async (req: Request): Promise<ReplySuccess> => {
  try {
    const { valid, data } = await tokenCheck(req.decoded);
    if (valid && data) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return {
          code: statusCode.UnprocessableEntity,
          response: { status: 0, message: errors.array()[0].msg },
        };
      }
      await createUserHash(
        {
          email: data.email,
          mobile: data.mobile,
          userid: data._id,
          leadid: data.lead_id,
          customerid: data.customer_id as ObjectId,
        },
        0,
        req.body.password
      );
      const { modifiedCount }: UpdateOne = await UpdateOneDocument(
        CollectionName.User,
        { _id: { $eq: data._id } },
        { $set: { emailinvite: true } },
        {}
      );
      if (!modifiedCount) {
        await DeleteOneDocument(CollectionName.UserCred, { userid: data._id });
        return {
          code: statusCode.BadRequest,
          response: { status: 0, message: 'Error in updating' },
        };
      } else {
        return {
          code: statusCode.Success,
          response: {
            status: 1,
            message: 'Registered Successfully',
          },
        };
      }
    } else {
      return {
        code: statusCode.Unauthorized,
        response: { status: 0, message: 'Unauthorized Access' },
      };
    }
  } catch (e) {
    return {
      code: statusCode.InternalServer,
      response: { status: 0, message: 'Server error' },
    };
  }
};

export const newLeadSignup = async (req: Request): Promise<ReplySuccess> => {
  try {
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: { status: 0, message: errors.array()[0].msg },
      };
    }
    const id = new ObjectId();
    const insertData: LeadSignup = {
      _id: id,
      name: req.body.name,
      business_email: req.body.business_email,
      mobile: req.body.mobile,
      company: req.body.companyname,
      industry_id: req.body.industry_id
        ? new ObjectId(req.body.industry_id)
        : req.body.industry_id,
      uq_id: `${CollectionName.Lead}_${id}`,
      company_name: req.body.company_name,
      company_size: req.body.company_size,
      brief_business_requirement: req.body.brief_business_requirement,
      source: req.body.source ?? 'Get Started',
      recordstatus: 1,
      internalstatus: 1,
      externalstatus: 1,
      createdon: Date.now(),
      createdby: req.context?.loginUserId || 0,
      modifiedon: Date.now(),
      modifiedby: req.context?.loginUserId || 0,
    };
    const { insertedId, acknowledged }: InsertOne = await InsertOneDocument(
      CollectionName.Lead,
      insertData
    );
    if (insertedId && acknowledged) {
      return {
        code: statusCode.Success,
        response: {
          status: 1,
          message:
            'Thanks for signing up. Email will be sent to proceed further.',
          ...((process.env.NODE_ENV === 'dev' ||
            process.env.NODE_ENV === 'devLocal') && { data: insertedId }),
        },
      };
    } else {
      return {
        code: statusCode.InternalServer,
        response: {
          status: 0,
          message: 'Error in submitting the request. Please try again later.',
        },
      };
    }
  } catch (e) {
    return {
      code: statusCode.InternalServer,
      response: { status: 0, message: 'Server error' },
    };
  }
};

const tokenCheck = async (
  decoded?: AuthUserToken
): Promise<{ valid: boolean; data?: User }> => {
  try {
    if (decoded?.email && decoded?.id) {
      const lead = (await GetOneDocument(
        CollectionName.Lead,
        {
          business_email: { $eq: decoded.email },
          internalstatus: { $eq: 1 },
          externalstatus: { $eq: 1 },
        },
        { business_email: 1 }
      )) as Lead;
      const user = (await GetOneDocument(
        CollectionName.User,
        {
          _id: { $eq: new ObjectId(decoded.id) },
          internalstatus: { $eq: 1 },
          externalstatus: { $eq: 1 },
        },
        { _id: 1, email: 1, mobile: 1, lead_id: 1, customer_id: 1 }
      )) as User;
      if (lead?.business_email && user?.email === decoded.email) {
        return { valid: true, data: user };
      }
    }
    return { valid: false };
  } catch (e) {
    return { valid: false };
  }
};

export const scheduleDemo = async (req: Request): Promise<ReplySuccess> => {
  try {
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: { status: 0, message: errors.array()[0].msg },
      };
    }
    const id = new ObjectId();
    const insertData: ScheduleDemo = {
      _id: id,
      business_email: req.body.business_email,
      industry_id: req.body.industry_id
        ? new ObjectId(req.body.industry_id)
        : req.body.industry_id,
      uq_id: `${CollectionName.Lead}_${id}`,
      company_name: req.body.company_name,
      company_size: req.body.company_size,
      brief_business_requirement: req.body.brief_business_requirement,
      source: 'Schedule Demo',
      recordstatus: 1,
      internalstatus: 1,
      externalstatus: 1,
      createdon: Date.now(),
      createdby: req.context?.loginUserId || 0,
      modifiedon: Date.now(),
      modifiedby: req.context?.loginUserId || 0,
    };
    const { insertedId, acknowledged }: InsertOne = await InsertOneDocument(
      CollectionName.Lead,
      insertData
    );
    if (insertedId && acknowledged) {
      return {
        code: statusCode.Success,
        response: {
          status: 1,
          message:
            'Thanks for scheduling a demo with us. Email will be sent to proceed further.',
          ...((process.env.NODE_ENV === 'dev' ||
            process.env.NODE_ENV === 'devLocal') && { data: insertedId }),
        },
      };
    } else {
      return {
        code: statusCode.InternalServer,
        response: {
          status: 0,
          message: 'Error in submitting the request. Please try again later.',
        },
      };
    }
  } catch (e) {
    return {
      code: statusCode.InternalServer,
      response: { status: 0, message: 'Server error' },
    };
  }
};

export const plans = async (req: Request): Promise<ReplySuccess> => {
  try {
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: { status: 0, message: errors.array()[0].msg },
      };
    }
    const id = new ObjectId();
    const insertData: Plan = {
      _id: id,
      name: req.body.name,
      business_email: req.body.business_email,
      mobile: req.body.mobile,
      company: req.body.companyname,
      plan: req.body.plan ?? null,
      industry_id: req.body.industry_id
        ? new ObjectId(req.body.industry_id)
        : req.body.industry_id,
      uq_id: `${CollectionName.Lead}_${id}`,
      company_name: req.body.company_name,
      company_size: req.body.company_size,
      brief_business_requirement: req.body.brief_business_requirement,
      source: `Pricing`,
      recordstatus: 1,
      internalstatus: 1,
      externalstatus: 1,
      createdon: Date.now(),
      createdby: req.context?.loginUserId || 0,
      modifiedon: Date.now(),
      modifiedby: req.context?.loginUserId || 0,
    };
    const { insertedId, acknowledged }: InsertOne = await InsertOneDocument(
      CollectionName.Lead,
      insertData
    );
    if (insertedId && acknowledged) {
      return {
        code: statusCode.Success,
        response: {
          status: 1,
          message:
            `Thanks for signing up with our ${req.body.plan}. Email will be sent to proceed further.`,
          ...((process.env.NODE_ENV === 'dev' ||
            process.env.NODE_ENV === 'devLocal') && { data: insertedId }),
        },
      };
    } else {
      return {
        code: statusCode.InternalServer,
        response: {
          status: 0,
          message: 'Error in submitting the request. Please try again later.',
        },
      };
    }
  } catch (e) {
    return {
      code: statusCode.InternalServer,
      response: { status: 0, message: 'Server error' },
    };
  }
};

export const contactUs = async (req: Request): Promise<ReplySuccess> => {
  try {
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: { status: 0, message: errors.array()[0].msg },
      };
    }
    const id = new ObjectId();
    const insertData: ContactUs = {
      _id: id,
      name: req.body.name,
      business_email: req.body.business_email,
      mobile: req.body.mobile,
      country: req.body.country,
      company: req.body.companyname,
      industry_id: req.body.industry_id
        ? new ObjectId(req.body.industry_id)
        : req.body.industry_id,
      uq_id: `${CollectionName.Lead}_${id}`,
      company_name: req.body.company_name,
      company_size: req.body.company_size,
      brief_business_requirement: req.body.brief_business_requirement,
      source: `Contact Us`,
      recordstatus: 1,
      internalstatus: 1,
      externalstatus: 1,
      createdon: Date.now(),
      createdby: req.context?.loginUserId || 0,
      modifiedon: Date.now(),
      modifiedby: req.context?.loginUserId || 0,
    };
    const { insertedId, acknowledged }: InsertOne = await InsertOneDocument(
      CollectionName.Lead,
      insertData
    );
    if (insertedId && acknowledged) {
      return {
        code: statusCode.Success,
        response: {
          status: 1,
          message:
            `Thanks for contacting us. Email will be sent to proceed further.`,
          ...((process.env.NODE_ENV === 'dev' ||
            process.env.NODE_ENV === 'devLocal') && { data: insertedId }),
        },
      };
    } else {
      return {
        code: statusCode.InternalServer,
        response: {
          status: 0,
          message: 'Error in submitting the request. Please try again later.',
        },
      };
    }
  } catch (e) {
    return {
      code: statusCode.InternalServer,
      response: { status: 0, message: 'Server error' },
    };
  }
};