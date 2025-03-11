import { Request } from 'express';
import { validationResult } from 'express-validator';
import { ObjectId } from 'mongodb';
import { getMatchStatus } from '../../helper/shared';
import { EmailTemplate } from '../../types/collection/emailtemplate';
import { statusCode } from '../../types/internalType';
import {
  CollectionName,
  GetDocExt,
  InsertOne,
  UpdateOne,
} from '../../types/mongoType';
import { ReplySuccess, PageData } from '../../types/responseType';
import {
  GetCount,
  GetDocument,
  GetOneDocument,
  InsertOneDocument,
  UpdateOneDocument,
} from '../../connector/mongodb';

export const newEmailTemplate = async (req: Request): Promise<ReplySuccess> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: { status: 0, message: errors.array()[0].msg },
      };
    }
    const exists: number = await GetCount(CollectionName.EmailTemplate, {
      name: { $eq: req.body.name },
    });
    if (!exists) {
      const insertData: EmailTemplate = {
        name: req.body.name,
        sender_name: req.body.sender_name,
        sender: req.body.sender,
        subject: req.body.subject,
        content: req.body.content,
        internalstatus: 1,
        externalstatus: 1,
        createdon: Date.now(),
        createdby: req.context.loginUserId,
        modifiedon: Date.now(),
        modifiedby: req.context.loginUserId,
      };
      const { insertedId, acknowledged }: InsertOne = await InsertOneDocument(
        CollectionName.EmailTemplate,
        insertData
      );
      if (insertedId && acknowledged) {
        return {
          code: statusCode.Success,
          response: { status: 1, message: 'Template created successfully' },
        };
      } else {
        return {
          code: statusCode.InternalServer,
          response: { status: 0, message: 'Error in creating template' },
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
export const updateEmailTemplate = async (
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
    const exists: number = await GetCount(CollectionName.EmailTemplate, {
      name: { $eq: req.body.name },
      _id: { $ne: new ObjectId(req.body._id) },
    });
    if (!exists) {
      const updateData: EmailTemplate = {
        name: req.body.name,
        sender_name: req.body.sender_name,
        sender: req.body.sender,
        subject: req.body.subject,
        content: req.body.content,
        modifiedon: Date.now(),
        modifiedby: req.context.loginUserId,
      };
      const params = { $set: updateData };
      const { modifiedCount }: UpdateOne = await UpdateOneDocument(
        CollectionName.EmailTemplate,
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

export const getEmailTemplate = async (req: Request): Promise<ReplySuccess> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: { status: 0, message: errors.array()[0].msg },
      };
    }
    const emailtemplate = (await GetOneDocument(
      CollectionName.EmailTemplate,
      { _id: { $eq: new ObjectId(req.params.id) } },
      {}
    )) as EmailTemplate;
    if (emailtemplate) {
      return {
        code: statusCode.Success,
        response: { status: 1, message: 'success', data: emailtemplate },
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

export const getEmailTemplateList = async (
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
    const count: number = await GetCount(CollectionName.EmailTemplate, query);
    const pagination: PageData = {
      total: count,
      totalPage: Math.ceil(Number(count) / Number(req.params.size)),
      currentPage: Number(req.params.page),
      size: Number(req.params.size),
      currentSize: Number(req.params.size),
    };

    const emailtemplate = (await GetDocument(
      CollectionName.EmailTemplate,
      query,
      { createdby: 0, modifiedby: 0 },
      { sort, skip, limit: Number(req.params.size) }
    )) as EmailTemplate[];
    if (emailtemplate) {
      pagination.currentSize = emailtemplate.length;
      return {
        code: statusCode.Success,
        response: {
          status: 1,
          message: 'success',
          data: { list: emailtemplate, pagination },
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
