import { Request } from 'express';
import { validationResult } from 'express-validator';
import { ObjectId } from 'mongodb';
import { getMatchStatus } from '../../helper/shared';
import { User } from '../../types/collection/user';
import { statusCode } from '../../types/internalType';
import {
  CollectionName,
  GetDocExt,
  InsertOne,
  UpdateOne,
} from '../../types/mongoType';
import { PageData, ReplySuccess } from '../../types/responseType';
import {
  DeleteOneDocument,
  GetCount,
  GetDocument,
  GetOneDocument,
  InsertOneDocument,
  UpdateOneDocument,
} from '../../connector/mongodb';
import { Lead } from '../../types/collection/lead';

export const newUser = async (req: Request): Promise<ReplySuccess> => {
  const userid = new ObjectId();
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
      { _id: { $eq: new ObjectId(req.body.lead_id) } },
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

    const userEmailExists = (await GetOneDocument(
      CollectionName.User,
      {
        email: { $eq: lead.business_email },
        lead_id: { $ne: new ObjectId(req.body.lead_id) },
      },
      {}
    )) as User;
    if (userEmailExists) {
      return {
        code: statusCode.BadRequest,
        response: {
          status: 0,
          message: 'Lead with email already exists in user.',
        },
      };
    }

    const userExists = await GetCount(CollectionName.User, {
      lead_id: { $eq: new ObjectId(req.body.lead_id) },
      internalstatus: 1,
      externalstatus: 1,
    });
    if (userExists) {
      return {
        code: statusCode.Success,
        response: { status: 2, message: 'User already exists for this lead' },
      };
    }

    const customer = await GetOneDocument(
      CollectionName.Customer,
      { lead_id: { $eq: new ObjectId(req.body.lead_id) } },
      { _id: 1 }
    );
    const insertData: User = {
      _id: userid,
      firstname: lead.name,
      middlename: req.body.middlename,
      lastname: req.body.lastname,
      displayname: req.body.displayname,
      email: lead.business_email,
      mobile: lead.mobile,
      lead_id: new ObjectId(lead._id),
      ...(customer?._id && { customer_id: new ObjectId(customer._id) }),
      internalid: req.body.internalid
        ? new ObjectId(req.body.internalid)
        : req.body.internalid,
      managerid: req.body.managerid
        ? new ObjectId(req.body.managerid)
        : req.body.managerid,
      usertypeid: req.body.usertypeid
        ? new ObjectId(req.body.usertypeid)
        : req.body.usertypeid,
      emailinvite: req.body.emailinvite,
      twofaenrollment: req.body.twofaenrollment,
      internalstatus: 1,
      externalstatus: 1,
      createdon: Date.now(),
      createdby: req.context.loginUserId,
      modifiedon: Date.now(),
      modifiedby: req.context.loginUserId,
    };
    const { insertedId, acknowledged }: InsertOne = await InsertOneDocument(
      CollectionName.User,
      insertData
    );
    if (insertedId && acknowledged) {
      return {
        code: statusCode.Success,
        response: { status: 1, message: 'User created successfully' },
      };
    } else {
      await DeleteOneDocument(CollectionName.UserCred, { userid });
      return {
        code: statusCode.InternalServer,
        response: { status: 0, message: 'Error in creating user' },
      };
    }
  } catch (e) {
    await DeleteOneDocument(CollectionName.UserCred, { userid });
    return {
      code: statusCode.InternalServer,
      response: { status: 0, message: 'Server error' },
    };
  }
};
export const updateUser = async (req: Request): Promise<ReplySuccess> => {
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
      { _id: { $eq: new ObjectId(req.body.lead_id) } },
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

    const updateData = {
      middlename: req.body.middlename,
      lastname: req.body.lastname,
      displayname: req.body.displayname,
      internalid: req.body.internalid
        ? new ObjectId(req.body.internalid)
        : req.body.internalid,
      managerid: req.body.managerid
        ? new ObjectId(req.body.managerid)
        : req.body.managerid,
      usertypeid: req.body.usertypeid
        ? new ObjectId(req.body.usertypeid)
        : req.body.usertypeid,
      emailinvite: req.body.emailinvite,
      twofaenrollment: req.body.twofaenrollment,
      modifiedon: Date.now(),
      modifiedby: req.context.loginUserId,
    };
    const params = {
      $set: updateData,
    };
    const { modifiedCount }: UpdateOne = await UpdateOneDocument(
      CollectionName.User,
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
export const getUser = async (req: Request): Promise<ReplySuccess> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: { status: 0, message: errors.array()[0].msg },
      };
    }
    const user = (await GetOneDocument(
      CollectionName.User,
      { _id: { $eq: new ObjectId(req.params.id) } },
      {}
    )) as User;
    if (user) {
      return {
        code: statusCode.Success,
        response: { status: 1, message: 'success', data: user },
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
export const getUserList = async (req: Request): Promise<ReplySuccess> => {
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
    sort[req.params.sort] = req.params.order;
    const query = { internalstatus: { $in: getMatchStatus(req.params.list) } };
    const count: number = await GetCount(CollectionName.User, query);
    const pagination: PageData = {
      total: count,
      totalPage: Math.ceil(Number(count) / Number(req.params.size)),
      currentPage: Number(req.params.page),
      size: Number(req.params.size),
      currentSize: Number(req.params.size),
    };
    const user = count
      ? ((await GetDocument(
          CollectionName.User,
          query,
          { createdby: 0, modifiedby: 0 },
          { sort, skip, limit: Number(req.params.size) }
        )) as User[])
      : [];
    if (user) {
      pagination.currentSize = user.length;
      return {
        code: statusCode.Success,
        response: {
          status: 1,
          message: 'success',
          data: { list: user, pagination },
        },
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
