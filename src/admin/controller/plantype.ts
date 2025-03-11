import { Request } from 'express';
import { validationResult } from 'express-validator';
import { statusCode } from '../../types/internalType';
import { CollectionName } from '../../types/mongoType';
import { ReplySuccess } from '../../types/responseType';
import { GetDocument } from '../../connector/mongodb';
import { PlanType } from '../../types/collection/plan';

export const getAllActivePlanType = async (
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
    const plantype = (await GetDocument(
      CollectionName.PlanType,
      { internalstatus: { $in: [1] } },
      { createdby: 0, modifiedby: 0 },
      {}
    )) as PlanType[];
    if (plantype) {
      return {
        code: statusCode.Success,
        response: { status: 1, message: 'success', data: plantype },
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
