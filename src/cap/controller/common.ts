import { UpdateManyDocument } from '../../connector/mongodb';
import { ObjectId } from 'mongodb';
import { validationResult } from 'express-validator';
import _ from 'lodash';
import { handleCatchError } from '../../helper/errorHandler';
import { Request } from 'express';
import { CollectionName, UpdateMany } from '../../types/mongoType';
import { Status, statusCode } from '../../types/internalType';
import { ReplySuccess } from '../../types/responseType';
import { getStatusValue, updateStatus } from '../../helper/shared';

export const statusUpdate = async (req: Request): Promise<ReplySuccess> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: { status: 0, message: errors.array()[0].msg },
      };
    }
    const ids: ObjectId[] = _.map(req.body.ids, (e) => new ObjectId(e));
    const params = {
      $set: {
        ...{
          [req.params.for ? 'externalstatus' : 'internalstatus']:
            getStatusValue(req.params.status as Status),
        },
        modifiedon: Date.now(),
        modifiedby: req.capcontext.loginUserId,
      },
    };
    if (req.body.collection === CollectionName.User) {
      await updateStatus(
        CollectionName.UserCred,
        { userid: { $in: ids } },
        params,
        {}
      );
    }
    const { modifiedCount }: UpdateMany = await UpdateManyDocument(
      req.body.collection,
      { _id: { $in: ids } },
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
      response: { status: 0, message: handleCatchError(e) },
    };
  }
};
