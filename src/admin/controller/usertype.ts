import {
  GetCount,
  GetDocument,
  GetOneDocument,
  InsertOneDocument,
  UpdateOneDocument,
} from '../../connector/mongodb';
import { validationResult } from 'express-validator';
import { ObjectId } from 'mongodb';
import {
  CollectionName,
  GetDocExt,
  InsertOne,
  UpdateOne,
} from '../../types/mongoType';
import { Request } from 'express';
import { PageData, ReplySuccess } from '../../types/responseType';
import { statusCode } from '../../types/internalType';
import { getMatchStatus } from '../../helper/shared';
import { UserType } from '../../types/collection/user';

export const newUserType = async (req: Request): Promise<ReplySuccess> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: { status: 0, message: errors.array()[0].msg },
      };
    }
    const exists: number = await GetCount(CollectionName.UserType, {
      name: { $eq: req.body.name },
    });
    if (!exists) {
      const insertData = {
        name: req.body.name,
        description: req.body.description,
        internalstatus: 1,
        externalstatus: 1,
        createdon: Date.now(),
        createdby: req.context.loginUserId,
        modifiedon: Date.now(),
        modifiedby: req.context.loginUserId,
      };
      const { insertedId, acknowledged }: InsertOne = await InsertOneDocument(
        CollectionName.UserType,
        insertData
      );
      if (insertedId && acknowledged) {
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
    } else {
      return {
        code: statusCode.BadRequest,
        response: { status: 0, message: 'Name already exists' },
      };
    }
  } catch (e) {
    return {
      code: statusCode.InternalServer,
      response: { status: 0, message: 'Server error' },
    };
  }
};
export const updateUserType = async (req: Request): Promise<ReplySuccess> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: { status: 0, message: errors.array()[0].msg },
      };
    }
    const exists: number = await GetCount(CollectionName.UserType, {
      name: { $eq: req.body.name },
      _id: { $ne: new ObjectId(req.body._id) },
    });
    if (!exists) {
      const updateData = {
        name: req.body.name,
        description: req.body.description,
        modifiedon: Date.now(),
        modifiedby: req.context.loginUserId,
      };
      const params = { $set: updateData };
      const { modifiedCount }: UpdateOne = await UpdateOneDocument(
        CollectionName.UserType,
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
    } else {
      return {
        code: statusCode.BadRequest,
        response: { status: 0, message: 'Name already exists' },
      };
    }
  } catch (e) {
    return {
      code: statusCode.InternalServer,
      response: { status: 0, message: 'Server error' },
    };
  }
};
export const getUserType = async (req: Request): Promise<ReplySuccess> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: { status: 0, message: errors.array()[0].msg },
      };
    }
    const usertype = (await GetOneDocument(
      CollectionName.UserType,
      { _id: { $eq: new ObjectId(req.params.id) } },
      {}
    )) as UserType;
    if (usertype) {
      return {
        code: statusCode.Success,
        response: { status: 1, message: 'success', data: usertype },
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
export const getUserTypeList = async (req: Request): Promise<ReplySuccess> => {
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
    const count: number = await GetCount(CollectionName.UserType, query);
    const pagination: PageData = {
      total: count,
      totalPage: Math.ceil(Number(count) / Number(req.params.size)),
      currentPage: Number(req.params.page),
      size: Number(req.params.size),
      currentSize: Number(req.params.size),
    };
    const usertype = (await GetDocument(
      CollectionName.UserType,
      query,
      { createdby: 0, modifiedby: 0 },
      { sort, skip, limit: Number(req.params.size) }
    )) as UserType[];
    if (usertype) {
      pagination.currentSize = usertype.length;
      return {
        code: statusCode.Success,
        response: {
          status: 1,
          message: 'success',
          data: { list: usertype, pagination },
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

export const getAllActiveUserType = async (
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
    const usertype = (await GetDocument(
      CollectionName.UserType,
      { internalstatus: { $in: [1] } },
      { createdby: 0, modifiedby: 0 },
      {}
    )) as UserType[];
    if (usertype) {
      return {
        code: statusCode.Success,
        response: { status: 1, message: 'success', data: usertype },
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
