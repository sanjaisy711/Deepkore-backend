import { Request } from 'express';
import { validationResult } from 'express-validator';
import { ObjectId } from 'mongodb';
import {
  GetAggregation,
  GetCount,
  GetOneDocument,
  InsertOneDocument,
  UpdateManyDocument,
  UpdateOneDocument,
} from '../../connector/mongodb';
import { Customer } from '../../types/collection/customer';
import { Lead } from '../../types/collection/lead';
import { Plan } from '../../types/collection/plan';
import { Subscription } from '../../types/collection/subscription';
import { User } from '../../types/collection/user';
import { PlanTypeName, statusCode } from '../../types/internalType';
import {
  CollectionName,
  GetDocExt,
  InsertOne,
  UpdateMany,
  UpdateOne,
} from '../../types/mongoType';
import { PageData, ReplySuccess } from '../../types/responseType';
import { getMatchStatus } from '../../helper/shared';
import { createUser } from '../helper/shared';

export const newCustomer = async (req: Request): Promise<ReplySuccess> => {
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
      name: { $eq: PlanTypeName.PAID },
    });
    if (!plantypecount) {
      return {
        code: statusCode.BadRequest,
        response: {
          status: 0,
          message: 'Invalid Paid Plan Type',
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

    if (req.body.sync === undefined || req.body.sync === null) {
      const userExists = await GetCount(CollectionName.User, {
        lead_id: { $eq: new ObjectId(req.body.lead_id) },
        internalstatus: 1,
        externalstatus: 1,
        customer_id: { $exists: false },
      });
      if (userExists) {
        return {
          code: statusCode.Success,
          response: { status: 2, message: 'Account Exists' },
        };
      }
    }

    const updateData: Customer = {
      planid: new ObjectId(req.body.planid),
      lead_id: new ObjectId(req.body.lead_id),
      dzitrauser_id: new ObjectId(req.body.dzitrauser_id),
      onboarded_date: new Date(req.body.onboarded_date).getTime(),
      subscription_validity: new Date(req.body.subscription_validity).getTime(),
      remind_before: req.body.remind_before,
      purchase_id: req.body.purchase_id,
      internalstatus: 1,
      externalstatus: 1,
      modifiedon: Date.now(),
      modifiedby: req.context.loginUserId,
    };
    const params = {
      $set: updateData,
    };
    const { upsertedCount, modifiedCount, upsertedId }: UpdateOne =
      await UpdateOneDocument(
        CollectionName.Customer,
        {
          lead_id: new ObjectId(req.body.lead_id),
          internalstatus: 1,
          externalstatus: 1,
        },
        params,
        { upsert: true }
      );
    if (upsertedCount || modifiedCount) {
      if (upsertedCount && upsertedId) {
        UpdateOneDocument(
          CollectionName.Customer,
          { _id: new ObjectId(req.body._id) },
          {
            $set: {
              uq_id: `${CollectionName.Customer}_${upsertedId}`,
              createdon: Date.now(),
              createdby: req.context.loginUserId,
            },
          },
          {}
        ).catch((e) => e);
      }
      const sync = req.body.sync === true || req.body.sync === 'true';
      return await createSubscription(req.context, lead, sync);
    } else {
      return {
        code: statusCode.BadRequest,
        response: { status: 0, message: 'Error in creating customer' },
      };
    }
  } catch (e) {
    return {
      code: statusCode.InternalServer,
      response: { status: 0, message: 'Server error' },
    };
  }
};

export const getCustomer = async (req: Request): Promise<ReplySuccess> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: { status: 0, message: errors.array()[0].msg },
      };
    }
    const customer = (await GetOneDocument(
      CollectionName.Customer,
      { _id: { $eq: new ObjectId(req.params.id) } },
      {}
    )) as Customer;
    if (customer) {
      return {
        code: statusCode.Success,
        response: { status: 1, message: 'success', data: customer },
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

export const getCustomerList = async (req: Request): Promise<ReplySuccess> => {
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
                from: CollectionName.DzitraUser,
                let: { dzitrauser_id: '$dzitrauser_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ['$_id', '$$dzitrauser_id'] },
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      name: 1,
                      display_name: 1,
                    },
                  },
                ],
                as: 'duser',
              },
            },
            {
              $unwind: {
                path: '$duser',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                _id: 1,
                externalstatus: 1,
                internalstatus: 1,
                lead_id: '$lead._id',
                lead_name: '$lead.name',
                dzitrauser_id: '$duser._id',
                dzitrauser_name: '$duser.name',
                dzitrauser_display_name: '$duser.display_name',
                onboarded_date: 1,
                planid: '$plan._id',
                plan_name: '$plan.planname',
                plan_internal_name: '$plan.internal_name',
                purchase_id: 1,
                remind_before: 1,
                subscription_validity: 1,
                modifiedon: 1,
                updatedAt: 1,
              },
            },
          ],
        },
      },
    ];
    const customer = await GetAggregation(CollectionName.Customer, aggregate);
    const count = customer?.[0]?.all?.[0]?.all ?? 0;
    const pagination: PageData = {
      total: count,
      totalPage: Math.ceil(Number(count) / Number(req.params.size)),
      currentPage: Number(req.params.page),
      size: Number(req.params.size),
      currentSize: customer?.[0]?.listData?.length ?? 0,
    };
    return {
      code: statusCode.Success,
      response: {
        status: 1,
        message: 'success',
        data: { list: customer?.[0]?.listData ?? [], pagination },
      },
    };
  } catch (e) {
    return {
      code: statusCode.InternalServer,
      response: { status: 0, message: 'Server error' },
    };
  }
};

async function createSubscription(
  context: { loginUserId: ObjectId },
  lead: Lead,
  sync: boolean
): Promise<ReplySuccess> {
  const customer = (await GetOneDocument(
    CollectionName.Customer,
    {
      lead_id: { $eq: new ObjectId(lead._id) },
      internalstatus: 1,
      externalstatus: 1,
    },
    {}
  )) as Customer;
  if (!customer) {
    return {
      code: statusCode.InternalServer,
      response: { status: 0, message: 'Error in fetching customer' },
    };
  }
  const { matchedCount, modifiedCount }: UpdateMany = await UpdateManyDocument(
    CollectionName.Subscription,
    { lead_id: { $eq: new ObjectId(lead._id) } },
    {
      $set: {
        internalstatus: 0,
        externalstatus: 0,
        modifiedon: Date.now(),
        modifiedby: context.loginUserId,
      },
    },
    {}
  );
  if (matchedCount && !modifiedCount) {
    return {
      code: statusCode.InternalServer,
      response: { status: 0, message: 'Error in processing subscription' },
    };
  }

  const id = new ObjectId();
  const insertData: Subscription = {
    _id: id,
    planid: new ObjectId(customer.planid),
    lead_id: new ObjectId(customer.lead_id),
    customer_id: new ObjectId(customer._id),
    uq_id: `${CollectionName.Subscription}_${id}`,
    startdate: customer.onboarded_date,
    enddate: customer.subscription_validity,
    maxenddate: customer.subscription_validity,
    recordstatus: 1,
    internalstatus: 1,
    externalstatus: 1,
    createdon: Date.now(),
    createdby: context.loginUserId,
    modifiedon: Date.now(),
    modifiedby: context.loginUserId,
  };

  const { insertedId, acknowledged }: InsertOne = await InsertOneDocument(
    CollectionName.Subscription,
    insertData
  );
  if (insertedId && acknowledged) {
    return await createUser(context, lead, customer, sync);
  } else {
    return {
      code: statusCode.InternalServer,
      response: {
        status: 0,
        message: 'Error in submitting the request. Please try again later.',
      },
    };
  }
}
// export const fetchEmailById = async (id: string): Promise<string | null> => {
//   try {
//     const document = await GetOneDocument(
//       CollectionName.Lead, 
//       { _id: { $eq: new ObjectId(id) } }, 
//       { business_email: 1 } 
//     );

//     if (!document || !document.business_email) {
//       console.log('No document found');
//       return null;
//     }
//     const email = document.business_email;
//     return email;
//   } catch (error) {
//     console.error('Error fetching document:', error);
//     throw error;
//   }
// };
