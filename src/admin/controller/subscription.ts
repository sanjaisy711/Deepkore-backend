import { Request } from 'express';
import { validationResult } from 'express-validator';
import { ObjectId } from 'mongodb';
import {
  GetAggregation,
  GetCount,
  GetOneDocument,
  InsertOneDocument,
} from '../../connector/mongodb';
import { Lead } from '../../types/collection/lead';
import { Plan } from '../../types/collection/plan';
import { Subscription } from '../../types/collection/subscription';
import { User } from '../../types/collection/user';
import { PlanTypeName, statusCode } from '../../types/internalType';
import { CollectionName, GetDocExt, InsertOne } from '../../types/mongoType';
import { PageData, ReplySuccess } from '../../types/responseType';
import { getMatchStatus } from '../../helper/shared';
import { createUser } from '../helper/shared';

export const newSubscription = async (req: Request): Promise<ReplySuccess> => {
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
      {
        _id: { $eq: new ObjectId(req.body.planid) },
        internalstatus: 1,
        externalstatus: 1,
      },
      { plantypeid: 1 }
    )) as Plan;
    if (!plan?.plantypeid) {
      return {
        code: statusCode.BadRequest,
        response: {
          status: 0,
          message: 'Invalid Plan',
        },
      };
    }

    const plantypecount = await GetCount(CollectionName.PlanType, {
      _id: { $eq: new ObjectId(plan.plantypeid) },
      name: { $eq: PlanTypeName.TRIAL },
    });
    if (!plantypecount) {
      return {
        code: statusCode.BadRequest,
        response: {
          status: 0,
          message: 'Invalid Trial Plan Type',
        },
      };
    }

    const lead = (await GetOneDocument(
      CollectionName.Lead,
      { _id: { $eq: new ObjectId(req.body.lead_id) } },
      { name: 1, business_email: 1, mobile: 1 }
    )) as Lead;
    if (!lead) {
      return {
        code: statusCode.BadRequest,
        response: {
          status: 0,
          message: 'Invalid Lead',
        },
      };
    }
    const userEmailExists = (await GetOneDocument(
      CollectionName.User,
      {
        email: { $eq: lead.business_email },
        lead_id: { $ne: new ObjectId(req.body.lead_id) },
      },
      {}
    )) as User;
    if (userEmailExists) {
      return {
        code: statusCode.BadRequest,
        response: {
          status: 0,
          message: 'Lead with email already exists in user.',
        },
      };
    }
    const userExists = await GetCount(CollectionName.User, {
      lead_id: { $eq: new ObjectId(req.body.lead_id) },
    });
    const customerExists = await GetCount(CollectionName.Customer, {
      lead_id: { $eq: new ObjectId(req.body.lead_id) },
    });
    if (!userExists && !customerExists) {
      const id = new ObjectId();
      const insertData: Subscription = {
        _id: id,
        planid: new ObjectId(req.body.planid),
        lead_id: new ObjectId(req.body.lead_id),
        uq_id: `${CollectionName.Lead}_${id}`,
        startdate: new Date(req.body.startdate).getTime(),
        enddate: new Date(req.body.enddate).getTime(),
        maxenddate: new Date(req.body.maxenddate).getTime(),
        recordstatus: 1,
        internalstatus: 1,
        externalstatus: 1,
        createdon: Date.now(),
        createdby: req.context.loginUserId,
        modifiedon: Date.now(),
        modifiedby: req.context.loginUserId,
      };
      const { insertedId, acknowledged }: InsertOne = await InsertOneDocument(
        CollectionName.Subscription,
        insertData
      );
      if (insertedId && acknowledged) {
        return await createUser(req.context, lead);
      } else {
        return {
          code: statusCode.InternalServer,
          response: {
            status: 0,
            message: 'Error in submitting the request. Please try again later.',
          },
        };
      }
    } else {
      return {
        code: statusCode.InternalServer,
        response: {
          status: 0,
          message: 'Lead already have subscription history.',
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

export const getSubsciption = async (req: Request): Promise<ReplySuccess> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: { status: 0, message: errors.array()[0].msg },
      };
    }
    const subscription = (await GetOneDocument(
      CollectionName.Subscription,
      { _id: { $eq: new ObjectId(req.params.id) } },
      {}
    )) as Subscription;
    if (subscription) {
      return {
        code: statusCode.Success,
        response: { status: 1, message: 'success', data: subscription },
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

export const getSubscriptionList = async (
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
                from: CollectionName.Plan,
                let: { planid: '$planid' },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ['$_id', '$$planid'] },
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      planname: 1,
                      internal_name: 1,
                    },
                  },
                ],
                as: 'plan',
              },
            },
            {
              $unwind: {
                path: '$plan',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: CollectionName.Lead,
                let: { lead_id: '$lead_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ['$_id', '$$lead_id'] },
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      name: 1,
                    },
                  },
                ],
                as: 'lead',
              },
            },
            {
              $unwind: {
                path: '$lead',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                _id: 1,
                planid: '$plan._id',
                plan_name: '$plan.planname',
                plan_internal_name: '$plan.internal_name',
                lead_id: '$lead._id',
                lead_name: '$lead.name',
                customer_id: 1,
                startdate: 1,
                enddate: 1,
                maxenddate: 1,
                recordstatus: 1,
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
    const subscription = await GetAggregation(
      CollectionName.Subscription,
      aggregate
    );
    const count = subscription?.[0]?.all?.[0]?.all ?? 0;
    const pagination: PageData = {
      total: count,
      totalPage: Math.ceil(Number(count) / Number(req.params.size)),
      currentPage: Number(req.params.page),
      size: Number(req.params.size),
      currentSize: subscription?.[0]?.listData?.length ?? 0,
    };
    return {
      code: statusCode.Success,
      response: {
        status: 1,
        message: 'success',
        data: { list: subscription?.[0]?.listData ?? [], pagination },
      },
    };
  } catch (e) {
    return {
      code: statusCode.InternalServer,
      response: { status: 0, message: 'Server error' },
    };
  }
};
