import { Request } from 'express';
import { validationResult } from 'express-validator';
import { ObjectId } from 'mongodb';
import { Role } from '../../types/collection/role';
import { UserRole } from '../../types/collection/user';
import { statusCode } from '../../types/internalType';
import { CollectionName, InsertOne, UpdateOne } from '../../types/mongoType';
import { ReplySuccess } from '../../types/responseType';
import {
  GetCount,
  GetOneDocument,
  InsertOneDocument,
  UpdateOneDocument,
} from '../../connector/mongodb';

export const newUserRole = async (req: Request): Promise<ReplySuccess> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: {
          status: 0,
          message: errors.array()[0].msg,
        },
      };
    }
    const exists: number = await GetCount(CollectionName.UserRole, {
      userid: { $eq: new ObjectId(req.body.userid) },
      internalstatus: 1,
      // roleid: { $eq: new ObjectId(req.body.roleid) },
    });
    if (!exists) {
      const insertData = {
        userid: new ObjectId(req.body.userid),
        leadid: new ObjectId(req.body.leadid),
        roleid: new ObjectId(req.body.roleid),
        internalstatus: 1,
        externalstatus: 1,
        createdon: Date.now(),
        createdby: req.context.loginUserId,
        modifiedon: Date.now(),
        modifiedby: req.context.loginUserId,
      };
      const { insertedId, acknowledged }: InsertOne = await InsertOneDocument(
        CollectionName.UserRole,
        insertData
      );
      if (insertedId && acknowledged) {
        return {
          code: statusCode.Success,
          response: {
            status: 1,
            message: 'UserRole created successfully',
          },
        };
      } else {
        return {
          code: statusCode.InternalServer,
          response: {
            status: 0,
            message: 'Error in creating userrole',
          },
        };
      }
    } else {
      return {
        code: statusCode.BadRequest,
        response: {
          status: 0,
          message: 'role already exists for the user',
        },
      };
    }
  } catch (e) {
    return {
      code: statusCode.InternalServer,
      response: {
        status: 0,
        message: 'Server error',
      },
    };
  }
};
export const updateUserRole = async (req: Request): Promise<ReplySuccess> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: {
          status: 0,
          message: errors.array()[0].msg,
        },
      };
    }
    const exists: number = await GetCount(CollectionName.UserRole, {
      userid: { $eq: new ObjectId(req.body.userid) },
      internalstatus: 1,
      // roleid: { $eq: new ObjectId(req.body.roleid) },
      _id: { $ne: new ObjectId(req.body._id) },
    });
    if (!exists) {
      const updateData = {
        userid: new ObjectId(req.body.userid),
        roleid: new ObjectId(req.body.roleid),
        modifiedon: Date.now(),
        modifiedby: req.context.loginUserId,
      };
      const params = {
        $set: updateData,
      };
      const { modifiedCount }: UpdateOne = await UpdateOneDocument(
        CollectionName.UserRole,
        { _id: new ObjectId(req.body._id) },
        params,
        {}
      );
      if (!modifiedCount) {
        return {
          code: statusCode.BadRequest,
          response: {
            status: 0,
            message: 'Error in updating',
          },
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
        response: {
          status: 0,
          message: 'role already exists for the user',
        },
      };
    }
  } catch (e) {
    return {
      code: statusCode.InternalServer,
      response: {
        status: 0,
        message: 'Server error',
      },
    };
  }
};
export const getUserRole = async (req: Request): Promise<ReplySuccess> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: {
          status: 0,
          message: errors.array()[0].msg,
        },
      };
    }
    // const userrole = (await GetDocument(
    //   CollectionName.UserRole,
    //   { userid: { $eq: new ObjectId(req.params.userid) } },
    //   { roleid: 1 },
    //   {}
    // )) as UserRole[];
    const userrole = (await GetOneDocument(
      CollectionName.UserRole,
      { userid: { $eq: new ObjectId(req.params.userid) }, internalstatus: 1 },
      { roleid: 1 }
    )) as UserRole;
    if (userrole.roleid) {
      // const ids: ObjectId[] = _.map(userrole, (e) => e.roleid);
      // const role = (await GetDocument(
      //   CollectionName.Role,
      //   { _id: { $in: ids } },
      //   { createdby: 0, modifiedby: 0 },
      //   {}
      // )) as Role[];
      const role = (await GetOneDocument(
        CollectionName.Role,
        { _id: { $in: userrole.roleid } },
        { createdby: 0, modifiedby: 0 }
      )) as Role;
      if (role) {
        return {
          code: statusCode.Success,
          response: { status: 1, message: 'success', data: role },
        };
      } else {
        return {
          code: statusCode.Success,
          response: {
            status: 1,
            message: 'No role found for the user',
            data: [],
          },
        };
      }
    } else {
      return {
        code: statusCode.Success,
        response: {
          status: 1,
          message: 'No role found for the user',
          data: [],
        },
      };
    }
  } catch (e) {
    return {
      code: statusCode.InternalServer,
      response: {
        status: 0,
        message: 'Server error',
      },
    };
  }
};
