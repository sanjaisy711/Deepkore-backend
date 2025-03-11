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
import { Role } from '../../types/collection/role';
import { PageData, ReplySuccess } from '../../types/responseType';
import { statusCode } from '../../types/internalType';
import { getMatchStatus } from '../../helper/shared';

export const newRole = async (req: Request): Promise<ReplySuccess> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: { status: 0, message: errors.array()[0].msg },
      };
    }
    const exists: number = await GetCount(CollectionName.Role, {
      name: { $eq: req.body.name },
    });
    if (!exists) {
      const insertData = {
        name: req.body.name,
        leadid: req.body.leadid,
        parentid: req.body.parentid
          ? new ObjectId(req.body.parentid)
          : req.body.parentid,
        internalstatus: 1,
        externalstatus: 1,
        createdon: Date.now(),
        createdby: req.context.loginUserId,
        modifiedon: Date.now(),
        modifiedby: req.context.loginUserId,
      };
      const { insertedId, acknowledged }: InsertOne = await InsertOneDocument(
        CollectionName.Role,
        insertData
      );
      if (insertedId && acknowledged) {
        return {
          code: statusCode.Success,
          response: { status: 1, message: 'Role created successfully' },
        };
      } else {
        return {
          code: statusCode.InternalServer,
          response: { status: 0, message: 'Error in creating role' },
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
export const updateRole = async (req: Request): Promise<ReplySuccess> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: { status: 0, message: errors.array()[0].msg },
      };
    }
    const exists: number = await GetCount(CollectionName.Role, {
      name: { $eq: req.body.name },
      _id: { $ne: new ObjectId(req.body._id) },
    });
    if (!exists) {
      const updateData = {
        name: req.body.name,
        leadid: req.body.leadid,
        parentid: req.body.parentid
          ? new ObjectId(req.body.parentid)
          : req.body.parentid,
        modifiedon: Date.now(),
        modifiedby: req.context.loginUserId,
      };
      const params = { $set: updateData };
      const { modifiedCount }: UpdateOne = await UpdateOneDocument(
        CollectionName.Role,
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
export const getRole = async (req: Request): Promise<ReplySuccess> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: { status: 0, message: errors.array()[0].msg },
      };
    }
    const role = (await GetOneDocument(
      CollectionName.Role,
      { _id: { $eq: new ObjectId(req.params.id) } },
      {}
    )) as Role;
    if (role) {
      return {
        code: statusCode.Success,
        response: { status: 1, message: 'success', data: role },
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
export const getRoleList = async (req: Request): Promise<ReplySuccess> => {
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
    const count: number = await GetCount(CollectionName.Role, query);
    const pagination: PageData = {
      total: count,
      totalPage: Math.ceil(Number(count) / Number(req.params.size)),
      currentPage: Number(req.params.page),
      size: Number(req.params.size),
      currentSize: Number(req.params.size),
    };
    const role = (await GetDocument(
      CollectionName.Role,
      query,
      { createdby: 0, modifiedby: 0 },
      { sort, skip, limit: Number(req.params.size) }
    )) as Role[];
    if (role) {
      pagination.currentSize = role.length;
      return {
        code: statusCode.Success,
        response: {
          status: 1,
          message: 'success',
          data: { list: role, pagination },
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
export const getAllActiveRole = async (req: Request): Promise<ReplySuccess> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: { status: 0, message: errors.array()[0].msg },
      };
    }
    const role = (await GetDocument(
      CollectionName.Role,
      { internalstatus: { $in: [1] } },
      { createdby: 0, modifiedby: 0 },
      {}
    )) as Role[];
    if (role) {
      return {
        code: statusCode.Success,
        response: { status: 1, message: 'success', data: role },
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
