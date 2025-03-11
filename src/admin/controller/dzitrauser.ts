import { Request } from 'express';
import { validationResult } from 'express-validator';
import { ObjectId } from 'mongodb';
import {
  GetCount,
  GetDocument,
  GetOneDocument,
  InsertOneDocument,
  UpdateOneDocument,
} from '../../connector/mongodb';
import { createPassword } from '../../helper/hashHelper';
import { DzitraUser } from '../../types/collection/dzitrauser';
import { statusCode } from '../../types/internalType';
import {
  CollectionName,
  GetDocExt,
  InsertOne,
  UpdateOne,
} from '../../types/mongoType';
import bcrypt from 'bcrypt';
import { getMatchStatus, isObjectId } from '../../helper/shared';
import {
  AuthUserToken,
  PageData,
  ReplySuccess,
} from '../../types/responseType';
import { mailBuild } from '../../helper/mailcontent';

import { getEncodedLinkTokenForAdmin } from '../helper/shared';

export const newDzitraUser = async (req: Request): Promise<ReplySuccess> => {
  const userid = new ObjectId();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: { status: 0, message: errors.array()[0].msg },
      };
    }
    const exists: number = await GetCount(CollectionName.DzitraUser, {
      email: { $eq: req.body.email },
    });
    if (!exists) {
      const pass =
        process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'devLocal'
          ? 'test@123'
          : createPassword(10, true, true);
      const insertData: DzitraUser = {
        _id: userid,
        name: req.body.name,
        display_name: req.body.display_name,
        email: req.body.email,
        hash: bcrypt.hashSync(pass, bcrypt.genSaltSync(10)),
        uq_id: `${CollectionName.DzitraUser}_${userid}`,
        internalstatus: 1,
        externalstatus: 1,
        recordstatus: 1,
        createdon: Date.now(),
        createdby: req.context.loginUserId,
        modifiedon: Date.now(),
        modifiedby: req.context.loginUserId,
      };
      const { insertedId, acknowledged }: InsertOne = await InsertOneDocument(
        CollectionName.DzitraUser,
        insertData
      );
      if (insertedId && acknowledged) {
        const mailData: any = {
          template: 'NewDzitraUser',
          to: req.body.email,
          html: [],
        };
        mailData.html.push({ name: 'name', value: req.body.name });
        mailData.html.push({ name: 'username', value: req.body.email });
        mailData.html.push({ name: 'pass', value: pass });
        mailBuild(mailData).catch((e) => {
          console.log(e);
        });
        return {
          code: statusCode.Success,
          response: { status: 1, message: 'User created successfully' },
        };
      } else {
        return {
          code: statusCode.InternalServer,
          response: { status: 0, message: 'Error in creating user' },
        };
      }
    } else {
      return {
        code: statusCode.BadRequest,
        response: { status: 0, message: 'Email already exists' },
      };
    }
  } catch (e) {
    return {
      code: statusCode.InternalServer,
      response: { status: 0, message: 'Server error' },
    };
  }
};

export const updateDzitraUser = async (req: Request): Promise<ReplySuccess> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: { status: 0, message: errors.array()[0].msg },
      };
    }
    const exists: number = await GetCount(CollectionName.DzitraUser, {
      email: { $eq: req.body.email },
      _id: { $ne: new ObjectId(req.body._id) },
    });
    if (!exists) {
      const updateData: DzitraUser = {
        _id: new ObjectId(req.body._id),
        name: req.body.name,
        display_name: req.body.display_name,
        email: req.body.email,
        modifiedon: Date.now(),
        modifiedby: req.context.loginUserId,
      };
      const params = {
        $set: updateData,
      };
      const { modifiedCount }: UpdateOne = await UpdateOneDocument(
        CollectionName.DzitraUser,
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
        response: { status: 0, message: 'Email already exists' },
      };
    }
  } catch (e) {
    return {
      code: statusCode.InternalServer,
      response: { status: 0, message: 'Server error' },
    };
  }
};

export const getDzitraUser = async (req: Request): Promise<ReplySuccess> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: { status: 0, message: errors.array()[0].msg },
      };
    }
    const user = (await GetOneDocument(
      CollectionName.DzitraUser,
      { _id: { $eq: new ObjectId(req.params.id) } },
      { hash: 0 }
    )) as DzitraUser;
    if (user) {
      return {
        code: statusCode.Success,
        response: { status: 1, message: 'success', data: user },
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

export const getDzitraUserList = async (
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
    const count: number = await GetCount(CollectionName.DzitraUser, query);
    const pagination: PageData = {
      total: count,
      totalPage: Math.ceil(Number(count) / Number(req.params.size)),
      currentPage: Number(req.params.page),
      size: Number(req.params.size),
      currentSize: Number(req.params.size),
    };
    const user = count
      ? ((await GetDocument(
          CollectionName.DzitraUser,
          query,
          { createdby: 0, modifiedby: 0, hash: 0 },
          { sort, skip, limit: Number(req.params.size) }
        )) as DzitraUser[])
      : [];
    if (user) {
      pagination.currentSize = user.length;
      return {
        code: statusCode.Success,
        response: {
          status: 1,
          message: 'success',
          data: { list: user, pagination },
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

export const getAllActiveDzitraUser = async (
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
    const dzitrauser = (await GetDocument(
      CollectionName.DzitraUser,
      { internalstatus: { $in: [1] } },
      { createdby: 0, modifiedby: 0 },
      {}
    )) as DzitraUser[];
    if (dzitrauser) {
      return {
        code: statusCode.Success,
        response: { status: 1, message: 'success', data: dzitrauser },
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

export const forgotPassword = async (req: Request): Promise<ReplySuccess> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: { status: 0, message: errors.array()[0].msg },
      };
    }
    const user = (await GetOneDocument(
      CollectionName.DzitraUser,
      {
        email: { $eq: req.body.email },
        internalstatus: { $in: [1] },
      },
      { _id: 1, email: 1, name: 1 }
    )) as DzitraUser;
    if (user?._id) {
      const link = `/admin-forgot-password?tk=${getEncodedLinkTokenForAdmin(
        user._id,
        user.email
      )}`;
      const mailData: any = {
        template: 'AdminResetForgotPassword',
        to: user.email,
        html: [],
      };
      mailData.html.push({ name: 'name', value: user.name });
      mailData.html.push({ name: 'link', value: link });
      mailBuild(mailData).catch((e) => {
        console.log(e);
      });
      return {
        code: statusCode.Success,
        response: {
          status: 1,
          message:
            'Link to reset forgot password sent to the mail successfully',
          ...((process.env.NODE_ENV === 'dev' ||
            process.env.NODE_ENV === 'devLocal') && { data: link }),
        },
      };
    } else {
      return {
        code: statusCode.BadRequest,
        response: { status: 0, message: 'Invalid user email' },
      };
    }
  } catch (e) {
    return {
      code: statusCode.InternalServer,
      response: { status: 0, message: 'Server error' },
    };
  }
};

export const checkResetLinkExpiry = async (
  req: Request
): Promise<ReplySuccess> => {
  if ((await tokenCheck(req.decoded)).valid) {
    return {
      code: statusCode.Success,
      response: {
        status: 1,
        message: 'Valid Link',
      },
    };
  } else {
    return {
      code: statusCode.Unauthorized,
      response: { status: 0, message: 'Unauthorized Access' },
    };
  }
};

export const adminResetForgotPassword = async (
  req: Request
): Promise<ReplySuccess> => {
  try {
    const { valid, data } = await tokenCheck(req.decoded);
    if (valid && data) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return {
          code: statusCode.UnprocessableEntity,
          response: { status: 0, message: errors.array()[0].msg },
        };
      }
      const { modifiedCount }: UpdateOne = await UpdateOneDocument(
        CollectionName.DzitraUser,
        { _id: { $eq: data._id } },
        {
          $set: {
            hash: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10)),
          },
        },
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
          response: {
            status: 1,
            message: 'Password reset successfully.',
          },
        };
      }
    } else {
      return {
        code: statusCode.Unauthorized,
        response: { status: 0, message: 'Unauthorized Access' },
      };
    }
  } catch (e) {
    return {
      code: statusCode.InternalServer,
      response: { status: 0, message: 'Server error' },
    };
  }
};

export const adminResetPassword = async (
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
    const user = await GetOneDocument(
      CollectionName.DzitraUser,
      { _id: req.context.loginUserId },
      { _id: 1, hash: 1 }
    );
    if (!user || !isObjectId(user._id)) {
      return {
        code: statusCode.BadRequest,
        response: { status: 0, message: 'Invalid Account Details' },
      };
    }
    if (!bcrypt.compareSync(req.body.password, user.hash)) {
      return {
        code: statusCode.BadRequest,
        response: {
          status: 0,
          message:
            'You are not authorized to reset the password. Verify that you are using valid credentials',
        },
      };
    }
    const { modifiedCount }: UpdateOne = await UpdateOneDocument(
      CollectionName.DzitraUser,
      { _id: { $eq: user._id } },
      {
        $set: {
          hash: bcrypt.hashSync(req.body.newpassword, bcrypt.genSaltSync(10)),
        },
      },
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
        response: {
          status: 1,
          message: 'Password reset successfully.',
        },
      };
    }
  } catch (e) {
    return {
      code: statusCode.InternalServer,
      response: { status: 0, message: 'Server error' },
    };
  }
};

const tokenCheck = async (
  decoded?: AuthUserToken
): Promise<{ valid: boolean; data?: DzitraUser }> => {
  try {
    if (decoded?.email && decoded?.id) {
      const dzitrauser = (await GetOneDocument(
        CollectionName.DzitraUser,
        {
          _id: { $eq: new ObjectId(decoded.id) },
          internalstatus: { $eq: 1 },
          externalstatus: { $eq: 1 },
        },
        { _id: 1, email: 1 }
      )) as DzitraUser;
      if (dzitrauser?.email === decoded.email) {
        return { valid: true, data: dzitrauser };
      }
    }
    return { valid: false };
  } catch (e) {
    return { valid: false };
  }
};
