import {
  GetAggregation,
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
import { PageData, ReplySuccess } from '../../types/responseType';
import { PlanTypeName, statusCode } from '../../types/internalType';
import { getMatchStatus } from '../../helper/shared';
import { Plan, PlanType } from '../../types/collection/plan';

export const newPlan = async (req: Request): Promise<ReplySuccess> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: { status: 0, message: errors.array()[0].msg },
      };
    }

    const plantypecount = await GetCount(CollectionName.PlanType, {
      _id: { $eq: new ObjectId(req.body.plantypeid) },
      internalstatus: 1,
      externalstatus: 1,
    });
    if (!plantypecount) {
      return {
        code: statusCode.BadRequest,
        response: {
          status: 0,
          message: 'Invalid Plan Type',
        },
      };
    }

    const exists: number = await GetCount(CollectionName.Plan, {
      planname: { $eq: req.body.planname },
    });
    if (!exists) {
      const id = new ObjectId();
      const insertData: Plan = {
        _id: id,
        planname: req.body.planname,
        usercount: Number(req.body.usercount),
        dayscount: Number(req.body.dayscount),
        ...(req.body.remainder1 && { remainder1: Number(req.body.remainder1) }),
        ...(req.body.remainder2 && { remainder2: Number(req.body.remainder2) }),
        plantypeid: req.body.plantypeid
          ? new ObjectId(req.body.plantypeid)
          : req.body.plantypeid,
        price: Number(req.body.price),
        ...(req.body.days && { days: Number(req.body.days) }),
        ...(req.body.grace_period && {
          grace_period: Number(req.body.grace_period),
        }),
        internal_name: req.body.internal_name,
        uq_id: `${CollectionName.Plan}_${id}`,
        internalstatus: 1,
        externalstatus: 1,
        createdon: Date.now(),
        createdby: req.context.loginUserId,
        modifiedon: Date.now(),
        modifiedby: req.context.loginUserId,
      };
      const { insertedId, acknowledged }: InsertOne = await InsertOneDocument(
        CollectionName.Plan,
        insertData
      );
      if (insertedId && acknowledged) {
        return {
          code: statusCode.Success,
          response: { status: 1, message: 'Plan created successfully' },
        };
      } else {
        return {
          code: statusCode.InternalServer,
          response: { status: 0, message: 'Error in creating plan' },
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
export const updatePlan = async (req: Request): Promise<ReplySuccess> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: { status: 0, message: errors.array()[0].msg },
      };
    }

    const plantypecount = await GetCount(CollectionName.PlanType, {
      _id: { $eq: new ObjectId(req.body.plantypeid) },
      internalstatus: 1,
      externalstatus: 1,
    });
    if (!plantypecount) {
      return {
        code: statusCode.BadRequest,
        response: {
          status: 0,
          message: 'Invalid Plan Type',
        },
      };
    }

    const exists: number = await GetCount(CollectionName.Plan, {
      planname: { $eq: req.body.planname },
      _id: { $ne: new ObjectId(req.body._id) },
    });
    if (!exists) {
      const updateData: Plan = {
        planname: req.body.planname,
        usercount: req.body.usercount,
        dayscount: req.body.dayscount,
        remainder1: req.body.remainder1,
        remainder2: req.body.remainder2,
        plantypeid: req.body.plantypeid
          ? new ObjectId(req.body.plantypeid)
          : req.body.plantypeid,
        price: req.body.price,
        days: req.body.days,
        grace_period: req.body.grace_period,
        internal_name: req.body.internal_name,
        modifiedon: Date.now(),
        modifiedby: req.context.loginUserId,
      };
      const params = { $set: updateData };
      const { modifiedCount }: UpdateOne = await UpdateOneDocument(
        CollectionName.Plan,
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
export const getPlan = async (req: Request): Promise<ReplySuccess> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: { status: 0, message: errors.array()[0].msg },
      };
    }
    const plan = (await GetOneDocument(
      CollectionName.Plan,
      { _id: { $eq: new ObjectId(req.params.id) } },
      {}
    )) as Plan;
    if (plan) {
      return {
        code: statusCode.Success,
        response: { status: 1, message: 'success', data: plan },
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
export const getPlanList = async (req: Request): Promise<ReplySuccess> => {
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
    sort[req.params.sort] = Number(req.params.order);
    const aggregate: any[] = [
      { $match: { internalstatus: { $in: getMatchStatus(req.params.list) } } },
      {
        $facet: {
          all: [{ $count: 'all' }],
          listData: [
            {
              $sort: sort,
            },
            {
              $skip: skip,
            },
            {
              $limit: Number(req.params.size),
            },
            {
              $lookup: {
                from: CollectionName.PlanType,
                let: { plantypeid: '$plantypeid' },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ['$_id', '$$plantypeid'] },
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      name: 1,
                    },
                  },
                ],
                as: 'plantype',
              },
            },
            {
              $unwind: {
                path: '$plantype',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                _id: 1,
                planname: 1,
                internal_name: 1,
                usercount: 1,
                dayscount: 1,
                remainder1: 1,
                remainder2: 1,
                plantypeid: '$plantype._id',
                plantypename: '$plantype.name',
                price: 1,
                internalstatus: 1,
                externalstatus: 1,
                createdon: 1,
                modifiedon: 1,
                createdAt: 1,
                updatedAt: 1,
              },
            },
          ],
        },
      },
    ];
    const plan = await GetAggregation(CollectionName.Plan, aggregate);
    const count = plan?.[0]?.all?.[0]?.all ?? 0;
    const pagination: PageData = {
      total: count,
      totalPage: Math.ceil(Number(count) / Number(req.params.size)),
      currentPage: Number(req.params.page),
      size: Number(req.params.size),
      currentSize: plan?.[0]?.listData?.length ?? 0,
    };
    return {
      code: statusCode.Success,
      response: {
        status: 1,
        message: 'success',
        data: { list: plan?.[0]?.listData ?? [], pagination },
      },
    };
  } catch (e) {
    return {
      code: statusCode.InternalServer,
      response: { status: 0, message: 'Server error' },
    };
  }
};
export const getAllActivePlan = async (req: Request): Promise<ReplySuccess> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: { status: 0, message: errors.array()[0].msg },
      };
    }
    const plan = (await GetDocument(
      CollectionName.Plan,
      { internalstatus: { $in: [1] } },
      { createdby: 0, modifiedby: 0 },
      {}
    )) as Plan[];
    if (plan) {
      return {
        code: statusCode.Success,
        response: { status: 1, message: 'success', data: plan },
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

export const getAllActiveTrailPlan = async (
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
    const { _id } = (await GetOneDocument(
      CollectionName.PlanType,
      { name: PlanTypeName.TRIAL },
      { _id: 1 }
    )) as PlanType;
    const plan = (await GetDocument(
      CollectionName.Plan,
      { internalstatus: { $in: [1] }, plantypeid: { $eq: new ObjectId(_id) } },
      { createdby: 0, modifiedby: 0 },
      {}
    )) as Plan[];
    if (plan) {
      return {
        code: statusCode.Success,
        response: { status: 1, message: 'success', data: plan },
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
export const getAllActivePaidPlan = async (
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
    const { _id } = (await GetOneDocument(
      CollectionName.PlanType,
      { name: PlanTypeName.PAID },
      { _id: 1 }
    )) as PlanType;
    const plan = (await GetDocument(
      CollectionName.Plan,
      { internalstatus: { $in: [1] }, plantypeid: { $eq: new ObjectId(_id) } },
      { createdby: 0, modifiedby: 0 },
      {}
    )) as Plan[];
    if (plan) {
      return {
        code: statusCode.Success,
        response: { status: 1, message: 'success', data: plan },
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
