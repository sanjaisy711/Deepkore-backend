import { Request } from 'express';
import { validationResult } from 'express-validator';
import { Collection, ObjectId } from 'mongodb';
import { Lead, LeadOwner, LeadSignup } from '../../types/collection/lead';
import { User } from '../../types/collection/user';
import { statusCode } from '../../types/internalType';
import {
  CollectionName,
  GetDocExt,
  InsertOne,
  UpdateOne,
} from '../../types/mongoType';
import { ReplySuccess, PageData } from '../../types/responseType';
import {
  GetAggregation,
  GetDocument,
  GetOneDocument,
  InsertOneDocument,
  UpdateOneDocument,
} from '../../connector/mongodb';
import { getMatchStatus } from '../../helper/shared';
import { sendInviteLink } from '../helper/shared';

export const newLead = async (req: Request): Promise<ReplySuccess> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: { status: 0, message: errors.array()[0].msg },
      };
    }
    const id = new ObjectId();
    const insertData: Lead = {
      _id: id,
      name: req.body.name,
      business_email: req.body.business_email,
      mobile: req.body.mobile,
      country: req.body.country,
      industry_id: req.body.industry_id
        ? new ObjectId(req.body.industry_id)
        : req.body.industry_id,
      uq_id: `${CollectionName.Lead}_${id}`,
      company_name: req.body.company_name,
      company_size: req.body.company_size,
      brief_business_requirement: req.body.brief_business_requirement,
      source: req.body.source,
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
            'Thanks for submitting the request. Email will be send to proceed further.',
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

export const newLeadSignup = async (req: Request): Promise<ReplySuccess> => {
  try {
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
      company: req.body.company_name,
      industry_id: req.body.industry_id
        ? new ObjectId(req.body.industry_id)
        : req.body.industry_id,
      uq_id: `${CollectionName.Lead}_${id}`,
      company_name: req.body.company_name,
      company_size: req.body.company_size,
      brief_business_requirement: req.body.brief_business_requirement,
      source: req.body.source,
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
            'Thanks for signing up. Email will be send to proceed further.',
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

export const updateLead = async (req: Request): Promise<ReplySuccess> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: { status: 0, message: errors.array()[0].msg },
      };
    }
    const updateData = {
      name: req.body.name,
      business_email: req.body.business_email,
      mobile: req.body.mobile,
      country: req.body.country,
      industry_id: req.body.industry_id
        ? new ObjectId(req.body.industry_id)
        : req.body.industry_id,
      company_name: req.body.company_name,
      company_size: req.body.company_size,
      brief_business_requirement: req.body.brief_business_requirement,
      source: req.body.source,
      modifiedon: Date.now(),
      modifiedby: req.context.loginUserId,
    };
    const params = { $set: updateData };
    const { modifiedCount }: UpdateOne = await UpdateOneDocument(
      CollectionName.Lead,
      { _id: new ObjectId(req.body._id) },
      params,
      {}
    );
    if (!modifiedCount) {
      return {
        code: statusCode.BadRequest,
        response: { status: 0, message: 'Error in updating' },
      };
    } else {
      return {
        code: statusCode.Success,
        response: { status: 1, message: 'Updated successfully' },
      };
    }
  } catch (e) {
    return {
      code: statusCode.InternalServer,
      response: { status: 0, message: 'Server error' },
    };
  }
};

export const getLead = async (req: Request): Promise<ReplySuccess> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: { status: 0, message: errors.array()[0].msg },
      };
    }
    const lead = (await GetOneDocument(
      CollectionName.Lead,
      { _id: { $eq: new ObjectId(req.params.id) } },
      {}
    )) as Lead;
    if (lead) {
      return {
        code: statusCode.Success,
        response: { status: 1, message: 'success', data: lead },
      };
    } else {
      return {
        code: statusCode.BadRequest,
        response: { status: 0, message: 'Error in fetching' },
      };
    }
  } catch (e) {
    return {
      code: statusCode.InternalServer,
      response: { status: 0, message: 'Server error' },
    };
  }
};

export const getLeadList = async (req: Request): Promise<ReplySuccess> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: { status: 0, message: errors.array()[0].msg },
      };
    }
    const skip: number =
      (Number(req.params.page) - 1) * Number(req.params.size);
    const sort: GetDocExt['sort'] = {};
    sort[req.params.sort] = Number(req.params.order);
    const aggregate: any[] = [
      { $match: { internalstatus: { $in: getMatchStatus(req.params.list) } } },
      {
        $facet: {
          all: [{ $count: 'all' }],
          listData: [
            {
              $sort: sort,
            },
            {
              $skip: skip,
            },
            {
              $limit: Number(req.params.size),
            },
            {
              $lookup: {
                from: CollectionName.LeadStatus,
                let: { status_id: '$leadstatus_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ['$_id', '$$status_id'] },
                    },
                  },
                ],
                as: 'lead_status',
              },
            },
            {
              $unwind: {
                path: '$lead_status',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                business_email: 1,
                mobile: 1,
                source: 1,
                status: { $ifNull: ['$lead_status.name', 'New Request'] },
                createdon: 1,
                externalstatus: 1,
                internalstatus: 1,
                modifiedon: 1,
                recordstatus: 1,
              },
            },
          ],
        },
      },
    ];
    const lead = await GetAggregation(CollectionName.Lead, aggregate);
    const count = lead?.[0]?.all?.[0]?.all ?? 0;
    const pagination: PageData = {
      total: count,
      totalPage: Math.ceil(Number(count) / Number(req.params.size)),
      currentPage: Number(req.params.page),
      size: Number(req.params.size),
      currentSize: lead?.[0]?.listData?.length ?? 0,
    };
    return {
      code: statusCode.Success,
      response: {
        status: 1,
        message: 'success',
        data: { list: lead?.[0]?.listData ?? [], pagination },
      },
    };
  } catch (e) {
    return {
      code: statusCode.InternalServer,
      response: { status: 0, message: 'Server error' },
    };
  }
};

export const inviteLead = async (req: Request): Promise<ReplySuccess> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: { status: 0, message: errors.array()[0].msg },
      };
    }
    const lead = (await GetOneDocument(
      CollectionName.Lead,
      { _id: { $eq: new ObjectId(req.body.id) } },
      { name: 1, business_email: 1, mobile: 1 }
    )) as Lead;
    if (!lead) {
      return {
        code: statusCode.BadRequest,
        response: {
          status: 0,
          message: 'Invalid Lead',
        },
      };
    }
    const user = (await GetOneDocument(
      CollectionName.User,
      { email: { $eq: lead.business_email } },
      {}
    )) as User;
    if (!user?.emailinvite) {
      const id = user?._id ?? new ObjectId();
      if (!user) {
        const customer = await GetOneDocument(
          CollectionName.Customer,
          { lead_id: { $eq: new ObjectId(lead._id) } },
          { _id: 1 }
        );
        const insertData: User = {
          _id: id,
          firstname: lead.name,
          email: lead.business_email,
          mobile: lead.mobile,
          lead_id: new ObjectId(lead._id),
          ...(customer?._id && { customer_id: new ObjectId(customer._id) }),
          emailinvite: false,
          twofaenrollment: false,
          internalstatus: 1,
          externalstatus: 1,
          createdon: Date.now(),
          createdby: req.context.loginUserId,
          modifiedon: Date.now(),
          modifiedby: req.context.loginUserId,
        };
        const { insertedId }: InsertOne = await InsertOneDocument(
          CollectionName.User,
          insertData
        );
        if (!insertedId) {
          return {
            code: statusCode.InternalServer,
            response: { status: 0, message: 'Error in creating user' },
          };
        }
      }
      return await sendInviteLink(id, lead);
    } else {
      return {
        code: statusCode.BadRequest,
        response: {
          status: 0,
          message: 'Lead with email already exists in user.',
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

export const newLeadStatus = async (req: Request): Promise<ReplySuccess> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: { status: 0, message: errors.array()[0].msg },
      };
    }
    const { modifiedCount } = await UpdateOneDocument(
      CollectionName.Lead,
      { _id: new ObjectId(req.body.lead_id) },
      { $set: { leadstatus_id: new ObjectId(req.body.leadstatus_id) } },
      {}
    );
    if (!modifiedCount) {
      return {
        code: statusCode.InternalServer,
        response: {
          status: 0,
          message: 'Error in Updating.',
        },
      };
    }
    const insertData: LeadOwner = {
      lead_id: new ObjectId(req.body.lead_id),
      dzitrauser_id: new ObjectId(req.body.dzitrauser_id),
      leadstatus_id: new ObjectId(req.body.leadstatus_id),
      comments: req.body.comments,
      updateddate: new Date(req.body.updateddate).getTime(),
      recordstatus: 1,
      internalstatus: 1,
      externalstatus: 1,
      createdon: Date.now(),
      createdby: req.context.loginUserId,
      modifiedon: Date.now(),
      modifiedby: req.context.loginUserId,
    };
    const { insertedId, acknowledged }: InsertOne = await InsertOneDocument(
      CollectionName.LeadOwner,
      insertData
    );
    if (insertedId && acknowledged) {
      return {
        code: statusCode.Success,
        response: {
          status: 1,
          message: 'Status Updated Successfully',
        },
      };
    } else {
      return {
        code: statusCode.InternalServer,
        response: {
          status: 0,
          message: 'Error in Updating.',
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

export const getLeadOwner = async (req: Request): Promise<ReplySuccess> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: { status: 0, message: errors.array()[0].msg },
      };
    }
    const leadowner = (await GetDocument(
      CollectionName.LeadOwner,
      {
        lead_id: { $eq: new ObjectId(req.params.id) },
        internalstatus: { $in: [1] },
      },
      { createdby: 0, modifiedby: 0 },
      {}
    )) as LeadOwner[];
    if (leadowner) {
      return {
        code: statusCode.Success,
        response: { status: 1, message: 'success', data: leadowner },
      };
    } else {
      return {
        code: statusCode.BadRequest,
        response: { status: 0, message: 'Error in fetching' },
      };
    }
  } catch (e) {
    return {
      code: statusCode.InternalServer,
      response: { status: 0, message: 'Server error' },
    };
  }
};

export const getAllActiveLead = async (req: Request): Promise<ReplySuccess> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: { status: 0, message: errors.array()[0].msg },
      };
    }
    const lead = (await GetDocument(
      CollectionName.Lead,
      { internalstatus: { $in: [1] } },
      { createdby: 0, modifiedby: 0 },
      {}
    )) as Lead[];
    if (lead) {
      return {
        code: statusCode.Success,
        response: { status: 1, message: 'success', data: lead },
      };
    } else {
      return {
        code: statusCode.BadRequest,
        response: { status: 0, message: 'Error in fetching' },
      };
    }
  } catch (e) {
    return {
      code: statusCode.InternalServer,
      response: { status: 0, message: 'Server error' },
    };
  }
};

export const fetchUserById = async (id: string): Promise< { name: string, email: string } | null> => {
  try {
    const document = await GetOneDocument(
      CollectionName.DzitraUser, 
      { _id: { $eq: new ObjectId(id) } }, 
      { display_name: 1 , email : 1} 
    );

    if (!document || !document.display_name || !document.email) {
      console.log('No document found');
      return null;
    }
    const name : string = document.display_name;
    const email : string = document.email;

    return {name, email};
  } catch (error) {
    console.error('Error document:', error);
    throw error;
  }
};


export const fetchLeadStatusById = async (id: string, oldid: string): Promise<{ name: string, oldName: string } | null> => {
  try {
    const documentForOld = await GetOneDocument(
      CollectionName.LeadStatus,
      { _id: { $eq: new ObjectId(oldid) } }, 
      { name: 1 } 
    );
    const document = await GetOneDocument(
      CollectionName.LeadStatus, 
      { _id: { $eq: new ObjectId(id) } }, 
      { name: 1 } 
    );

    if (!document || !documentForOld.name || !document.name) {
      console.log('No document found');
      return null;
    }
    const name = document.name;
    const oldName = documentForOld.name;
    return {name,oldName};
  } catch (error) {
    console.error('Error document:', error);
    throw error;
  }
};
