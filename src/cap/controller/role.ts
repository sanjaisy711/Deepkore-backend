import { Request } from 'express';
import { validationResult } from 'express-validator';
import { ObjectId } from 'mongodb';
import {
  GetAggregation,
  GetDocument,
  UpdateManyDocument,
  UpdateOneDocument,
} from '../../connector/mongodb';
import { statusCode } from '../../types/internalType';
import { CollectionName, GetDocExt, UpdateMany } from '../../types/mongoType';
import { PageData, ReplySuccess } from '../../types/responseType';
import _ from 'lodash';
import { isObjectId } from '../../helper/shared';
import { UserRole } from '../../types/collection/user';

export const getRoleList = async (req: Request): Promise<ReplySuccess> => {
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
      {
        $match: {
          leadid: { $eq: req.capcontext.leadid },
          internalstatus: { $in: [1] },
        },
      },
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
                from: CollectionName.UserRole,
                let: { role_id: '$_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ['$roleid', '$$role_id'] },
                          { $eq: ['$internalstatus', 1] },
                        ],
                      },
                    },
                  },
                  {
                    $lookup: {
                      from: CollectionName.User,
                      let: { user_id: '$userid' },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $and: [
                                { $eq: ['$_id', '$$user_id'] },
                                { $eq: ['$internalstatus', 1] },
                              ],
                            },
                          },
                        },
                        {
                          $project: {
                            email: 1,
                            firstname: 1,
                            middlename: 1,
                            lastname: 1,
                            displayname: 1,
                          },
                        },
                      ],
                      as: 'user',
                    },
                  },
                  {
                    $unwind: {
                      path: '$user',
                    },
                  },
                  {
                    $project: {
                      _id: '$user._id',
                      email: '$user.email',
                      firstname: '$user.firstname',
                      middlename: '$user.middlename',
                      lastname: '$user.lastname',
                      displayname: '$user.displayname',
                    },
                  },
                ],
                as: 'users',
              },
            },
            // {
            //   $addFields: {
            //     useremails: {
            //       '$reduce': {
            //         input: '$user',
            //         initialValue: [],
            //         in: { $concatArrays: ["$$value", ["$$this.email"]] }
            //       }
            //     }
            //   }
            // },
            {
              $project: {
                _id: 1,
                name: 1,
                users: 1,
                usercount: {
                  $cond: {
                    if: { $isArray: '$users' },
                    then: { $size: '$users' },
                    else: 0,
                  },
                },
                createdon: 1,
                externalstatus: 1,
                modifiedon: 1,
                recordstatus: 1,
              },
            },
          ],
        },
      },
    ];
    const role = await GetAggregation(CollectionName.Role, aggregate);
    const count = role?.[0]?.all?.[0]?.all ?? 0;
    const pagination: PageData = {
      total: count,
      totalPage: Math.ceil(Number(count) / Number(req.params.size)),
      currentPage: Number(req.params.page),
      size: Number(req.params.size),
      currentSize: role?.[0]?.listData?.length ?? 0,
    };
    return {
      code: statusCode.Success,
      response: {
        status: 1,
        message: 'success',
        data: { list: role?.[0]?.listData ?? [], pagination },
      },
    };
  } catch (e) {
    return {
      code: statusCode.InternalServer,
      response: { status: 0, message: 'Server error' },
    };
  }
};

export const getUserForRole = async (req: Request): Promise<ReplySuccess> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: { status: 0, message: errors.array()[0].msg },
      };
    }

    const alluser = await GetDocument(
      CollectionName.UserRole,
      {
        roleid: { $ne: new ObjectId(req.params.id) },
        leadid: { $eq: req.capcontext.leadid },
        internalstatus: { $in: [1] },
      },
      { userid: 1 },
      {}
    );
    const alluserids = _.reduce(
      alluser,
      (users: ObjectId[], user: any): ObjectId[] => {
        users.push(user.userid);
        return users;
      },
      []
    );
    console.log({
      lead_id: { $eq: req.capcontext.leadid },
      internalstatus: { $in: [1] },
      _id: { $nin: alluserids },
    });

    const aggregate: any[] = [
      {
        $match: {
          lead_id: { $eq: req.capcontext.leadid },
          internalstatus: { $in: [1] },
          _id: { $nin: alluserids },
        },
      },
      {
        $lookup: {
          from: CollectionName.UserRole,
          let: { user_id: '$_id', role_id: new ObjectId(req.params.id) },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$roleid', '$$role_id'] },
                    { $eq: ['$userid', '$$user_id'] },
                    { $eq: ['$internalstatus', 1] },
                  ],
                },
              },
            },
          ],
          as: 'userrole',
        },
      },
      {
        $project: {
          email: 1,
          firstname: 1,
          middlename: 1,
          lastname: 1,
          displayname: 1,
          hasrole: {
            $cond: {
              if: { $isArray: '$userrole' },
              then: { $gt: [{ $size: '$userrole' }, 0] },
              else: false,
            },
          },
        },
      },
    ];
    const user = await GetAggregation(CollectionName.User, aggregate);
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

export const updateUserRole = async (req: Request): Promise<ReplySuccess> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: { status: 0, message: errors.array()[0].msg },
      };
    }
    const { matchedCount, modifiedCount }: UpdateMany =
      await UpdateManyDocument(
        CollectionName.UserRole,
        {
          leadid: { $eq: req.capcontext.leadid },
          roleid: { $eq: new ObjectId(req.body.roleid) },
        },
        {
          $set: {
            internalstatus: 0,
            externalstatus: 0,
            modifiedon: Date.now(),
            modifiedby: req.capcontext.loginUserId,
          },
        },
        {}
      );
    if (matchedCount && !modifiedCount) {
      return {
        code: statusCode.InternalServer,
        response: { status: 0, message: 'Error in updating user role' },
      };
    }
    const executeQuery = _.reduce(
      req.body.userids,
      (query: any[], userid: string) => {
        if (isObjectId(userid)) {
          const params = {
            $set: newUserRole(
              req.capcontext,
              new ObjectId(userid),
              new ObjectId(req.body.roleid)
            ),
          };
          query.push(
            UpdateOneDocument(
              CollectionName.UserRole,
              {
                leadid: { $eq: req.capcontext.leadid },
                roleid: new ObjectId(req.body.roleid),
                userid: { $eq: new ObjectId(userid) },
              },
              params,
              {
                upsert: true,
              }
            )
          );
        }
        return query;
      },
      []
    );
    await Promise.all(executeQuery);
    return {
      code: statusCode.Success,
      response: { status: 1, message: 'User role updated successfully' },
    };
  } catch (e) {
    return {
      code: statusCode.InternalServer,
      response: { status: 0, message: 'Server error' },
    };
  }
};

function newUserRole(
  context: { leadid: ObjectId; loginUserId: ObjectId },
  userid: ObjectId,
  roleid: ObjectId
): UserRole {
  return {
    userid,
    roleid,
    leadid: context.leadid,
    internalstatus: 1,
    externalstatus: 1,
    createdon: Date.now(),
    createdby: context.loginUserId,
    modifiedon: Date.now(),
    modifiedby: context.loginUserId,
  };
}
