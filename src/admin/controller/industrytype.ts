import { Request } from 'express';
import { validationResult } from 'express-validator';
import { IndustryType } from '../../types/collection/industrytype';
import { statusCode } from '../../types/internalType';
import { CollectionName } from '../../types/mongoType';
import { ReplySuccess } from '../../types/responseType';
import { GetDocument } from '../../connector/mongodb';

export const getAllActiveIndustryType = async (
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
    const industrytype = (await GetDocument(
      CollectionName.IndustryType,
      { internalstatus: { $in: [1] } },
      { createdby: 0, modifiedby: 0 },
      {}
    )) as IndustryType[];
    if (industrytype) {
      return {
        code: statusCode.Success,
        response: { status: 1, message: 'success', data: industrytype },
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
