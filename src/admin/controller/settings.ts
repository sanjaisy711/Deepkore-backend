import { Request } from 'express';
import { validationResult } from 'express-validator';
import { GENERAL } from '../../types/collection/general';
import { SMTP } from '../../types/collection/smtp';
import { statusCode } from '../../types/internalType';
import { CollectionName, UpdateOne } from '../../types/mongoType';
import { ReplySuccess } from '../../types/responseType';
import { UpdateOneDocument } from '../../connector/mongodb';

export const updateGeneral = async (req: Request): Promise<ReplySuccess> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: { status: 0, message: errors.array()[0].msg },
      };
    }
    const updateData: GENERAL = {
      title: req.body.title,
      site_url: req.body.site_url,
      modifiedon: Date.now(),
      modifiedby: req.context.loginUserId,
    };
    const params = { $set: updateData };
    const { upsertedCount, modifiedCount }: UpdateOne = await UpdateOneDocument(
      CollectionName.GENERAL,
      {},
      params,
      { upsert: true }
    );

    if (upsertedCount || modifiedCount) {
      return {
        code: statusCode.Success,
        response: { status: 1, message: 'Updated successfully' },
      };
    } else {
      return {
        code: statusCode.BadRequest,
        response: { status: 0, message: 'Error in updating' },
      };
    }
  } catch (e) {
    return {
      code: statusCode.InternalServer,
      response: { status: 0, message: 'Server error' },
    };
  }
};

export const updateSMTP = async (req: Request): Promise<ReplySuccess> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: { status: 0, message: errors.array()[0].msg },
      };
    }
    const updateData: SMTP = {
      mode: req.body.mode,
      client: req.body.client,
      secret: req.body.secret,
      modifiedon: Date.now(),
      modifiedby: req.context.loginUserId,
    };
    const params = { $set: updateData };
    const { upsertedCount, modifiedCount }: UpdateOne = await UpdateOneDocument(
      CollectionName.SMTP,
      {},
      params,
      { upsert: true }
    );

    if (upsertedCount || modifiedCount) {
      return {
        code: statusCode.Success,
        response: { status: 1, message: 'Updated successfully' },
      };
    } else {
      return {
        code: statusCode.BadRequest,
        response: { status: 0, message: 'Error in updating' },
      };
    }
  } catch (e) {
    return {
      code: statusCode.InternalServer,
      response: { status: 0, message: 'Server error' },
    };
  }
};
