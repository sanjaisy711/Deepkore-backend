import { Request } from 'express';
import { validationResult } from 'express-validator';
import _ from 'lodash';
import { ObjectId } from 'mongodb';
import { Role } from '../../types/collection/role';
import { statusCode } from '../../types/internalType';
import { CollectionName, InsertOne, UpdateOne } from '../../types/mongoType';
import { ReplySuccess } from '../../types/responseType';
import {
  GetCount,
  GetDocument,
  InsertOneDocument,
  UpdateOneDocument,
} from '../../connector/mongodb';
import { DzitraUserRole } from '../../types/collection/dzitrauser';

export const newDzitraUserRole = async (
  req: Request
): Promise<ReplySuccess> => {
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
    const exists: number = await GetCount(CollectionName.DzitraUserRole, {
      dzitrauser_id: { $eq: new ObjectId(req.body.dzitrauser_id) },
      dzitrarole_id: { $eq: new ObjectId(req.body.dzitrarole_id) },
    });
    if (!exists) {
      const insertData = {
        dzitrauser_id: new ObjectId(req.body.dzitrauser_id),
        dzitrarole_id: new ObjectId(req.body.dzitrarole_id),
        internalstatus: 1,
        externalstatus: 1,
        createdon: Date.now(),
        createdby: req.context.loginUserId,
        modifiedon: Date.now(),
        modifiedby: req.context.loginUserId,
      };
      const { insertedId, acknowledged }: InsertOne = await InsertOneDocument(
        CollectionName.DzitraUserRole,
        insertData
      );
      if (insertedId && acknowledged) {
        return {
          code: statusCode.Success,
          response: {
            status: 1,
            message: 'User Role created successfully',
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
export const updateDzitraUserRole = async (
  req: Request
): Promise<ReplySuccess> => {
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
    const exists: number = await GetCount(CollectionName.DzitraUserRole, {
      dzitrauser_id: { $eq: new ObjectId(req.body.dzitrauser_id) },
      dzitrarole_id: { $eq: new ObjectId(req.body.dzitrarole_id) },
      _id: { $ne: new ObjectId(req.body._id) },
    });
    if (!exists) {
      const updateData = {
        dzitrauser_id: new ObjectId(req.body.dzitrauser_id),
        dzitrarole_id: new ObjectId(req.body.dzitrarole_id),
        modifiedon: Date.now(),
        modifiedby: req.context.loginUserId,
      };
      const params = {
        $set: updateData,
      };
      const { modifiedCount }: UpdateOne = await UpdateOneDocument(
        CollectionName.DzitraUserRole,
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
export const getDzitraUserRole = async (
  req: Request
): Promise<ReplySuccess> => {
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
    const dzitrauserrole = (await GetDocument(
      CollectionName.DzitraUserRole,
      { dzitrauser_id: { $eq: new ObjectId(req.params.dzitrauser_id) } },
      { dzitrarole_id: 1 },
      {}
    )) as DzitraUserRole[];
    if (dzitrauserrole?.length) {
      const ids: ObjectId[] = _.map(dzitrauserrole, (e) => e.dzitrarole_id);
      const role = (await GetDocument(
        CollectionName.Role,
        { _id: { $in: ids } },
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
