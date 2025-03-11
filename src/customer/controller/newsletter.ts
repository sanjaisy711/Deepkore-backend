import { Request } from 'express';
import { validationResult } from 'express-validator';
import { UpdateOneDocument } from '../../connector/mongodb';
import { statusCode } from '../../types/internalType';
import { CollectionName, UpdateOne } from '../../types/mongoType';
import { ReplySuccess } from '../../types/responseType';

export const subscribeUser = async (req: Request): Promise<ReplySuccess> => {
  try {
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: { status: 0, message: errors.array()[0].msg },
      };
    }
    const insertData = {
      email: req.body.email,
      emailvalidated: false,
      optedout: false,
      internalstatus: 1,
      externalstatus: 1,
      is_lead: false,
      is_customer: false,
      createdon: Date.now(),
      createdby: 0,
      modifiedon: Date.now(),
      modifiedby: 0,
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
        response: { status: 1, message: 'Subscribed successfully' },
      };
    } else {
      return {
        code: statusCode.InternalServer,
        response: { status: 0, message: 'Error in subscribe' },
      };
    }
  } catch (e) {
    return {
      code: statusCode.InternalServer,
      response: { status: 0, message: 'Server error' },
    };
  }
};
