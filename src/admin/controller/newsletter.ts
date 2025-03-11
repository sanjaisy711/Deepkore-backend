import {
  GetCount,
  GetDocument,
  GetOneDocument,
  UpdateOneDocument,
} from '../../connector/mongodb';
import { validationResult } from 'express-validator';
import { ObjectId } from 'mongodb';
import { CollectionName, GetDocExt, UpdateOne } from '../../types/mongoType';
import { Request } from 'express';
import { PageData, ReplySuccess } from '../../types/responseType';
import { statusCode } from '../../types/internalType';
import { getMatchStatus } from '../../helper/shared';
import { NewsLetter } from '../../types/collection/newsletter';

export const newNewsletter = async (req: Request): Promise<ReplySuccess> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: { status: 0, message: errors.array()[0].msg },
      };
    }
    const insertData = {
      email: req.body.email,
      emailvalidated: req.body.emailvalidated,
      optedout: req.body.optedout,
      internalstatus: 1,
      externalstatus: 1,
      is_lead: req.body.is_lead,
      is_customer: req.body.is_customer,
      createdon: Date.now(),
      createdby: req.context.loginUserId,
      modifiedon: Date.now(),
      modifiedby: req.context.loginUserId,
    };
    const params = { $set: insertData };
    const { modifiedCount, upsertedCount }: UpdateOne = await UpdateOneDocument(
      CollectionName.NewsLetter,
      { email: req.body.email },
      params,
      { upsert: true }
    );
    if (modifiedCount || upsertedCount) {
      return {
        code: statusCode.Success,
        response: { status: 1, message: 'Created successfully' },
      };
    } else {
      return {
        code: statusCode.InternalServer,
        response: { status: 0, message: 'Error in creating' },
      };
    }
  } catch (e) {
    return {
      code: statusCode.InternalServer,
      response: { status: 0, message: 'Server error' },
    };
  }
};
export const updateNewsletter = async (req: Request): Promise<ReplySuccess> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: { status: 0, message: errors.array()[0].msg },
      };
    }
    const updateData = {
      email: req.body.email,
      emailvalidated: req.body.emailvalidated,
      optedout: req.body.optedout,
      is_lead: req.body.is_lead,
      is_customer: req.body.is_customer,
      modifiedon: Date.now(),
      modifiedby: req.context.loginUserId,
    };
    const params = { $set: updateData };
    const { modifiedCount }: UpdateOne = await UpdateOneDocument(
      CollectionName.NewsLetter,
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
export const getNewsletter = async (req: Request): Promise<ReplySuccess> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: { status: 0, message: errors.array()[0].msg },
      };
    }
    const newsletter = (await GetOneDocument(
      CollectionName.NewsLetter,
      { _id: { $eq: new ObjectId(req.params.id) } },
      {}
    )) as NewsLetter;
    if (newsletter) {
      return {
        code: statusCode.Success,
        response: { status: 1, message: 'success', data: newsletter },
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
export const getNewsletterList = async (
  req: Request
): Promise<ReplySuccess> => {
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
    const count: number = await GetCount(CollectionName.NewsLetter, query);
    const pagination: PageData = {
      total: count,
      totalPage: Math.ceil(Number(count) / Number(req.params.size)),
      currentPage: Number(req.params.page),
      size: Number(req.params.size),
      currentSize: Number(req.params.size),
    };
    const newsletter = (await GetDocument(
      CollectionName.NewsLetter,
      query,
      { createdby: 0, modifiedby: 0 },
      { sort, skip, limit: Number(req.params.size) }
    )) as NewsLetter[];
    if (newsletter) {
      pagination.currentSize = newsletter.length;
      return {
        code: statusCode.Success,
        response: {
          status: 1,
          message: 'success',
          data: { list: newsletter, pagination },
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
