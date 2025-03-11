import {
  GetOneDocument,
  InsertOneDocument,
  UpdateManyDocument,
  UpdateOneDocument,
} from '../../connector/mongodb';
import { statusCode, UserRoleName } from '../../types/internalType';
import {
  CollectionName,
  InsertOne,
  UpdateMany,
  UpdateOne,
} from '../../types/mongoType';
import { sign } from 'jsonwebtoken';
import ENV_PROP from '../../config/config';
import { ObjectId } from 'mongodb';
import { Lead } from '../../types/collection/lead';
import { ReplySuccess } from '../../types/responseType';
import { mailBuild } from '../../helper/mailcontent';
import { NewsLetter } from '../../types/collection/newsletter';
import { User } from '../../types/collection/user';
import { Customer } from '../../types/collection/customer';
import { Role } from '../../types/collection/role';
import _ from 'lodash';
import { jwtSigninToken } from '../../helper/shared';

export const sendInviteLink = async (
  id: ObjectId,
  lead: Lead
): Promise<ReplySuccess> => {
  try {
    const link = `/create-password?tk=${getEncodedLinkToken(
      id,
      lead.business_email
    )}`;
    const mailData: any = {
      template: 'LeadInvite',
      to: lead.business_email,
      html: [],
    };
    mailData.html.push({ name: 'lead_name', value: lead.name });
    mailData.html.push({ name: 'link', value: link });
    mailBuild(mailData).catch((e) => {
      console.log(e);
    });
    return {
      code: statusCode.Success,
      response: {
        status: 1,
        message: 'Invite sent successfully',
        ...((process.env.NODE_ENV === 'dev' ||
          process.env.NODE_ENV === 'devLocal') && { data: link }),
      },
    };
  } catch (e) {
    return {
      code: statusCode.InternalServer,
      response: { status: 0, message: 'Server error' },
    };
  }
};

function getEncodedLinkToken(id: ObjectId, email: string): string {
  return sign({ id, email, sub: 'customer' }, ENV_PROP.CUSTOMER_SECRET_KEY, {
    expiresIn: ENV_PROP.LEAD_INVITE_EXPIRE,
  });
}

export function getEncodedLinkTokenForAdmin(
  id: ObjectId,
  email: string
): string {
  return jwtSigninToken(
    {
      id,
      username: email,
      sub: 'admin',
    },
    ENV_PROP.ADMIN_SECRET_KEY,
    ENV_PROP.ADMIN_PASSLINK_EXPIRE
  );
}

export async function createUser(
  context: { loginUserId: ObjectId },
  lead: Lead,
  customer?: Customer,
  sync?: boolean
): Promise<ReplySuccess> {
  try {
    if (sync) {
      const params = { $set: { customer_id: new ObjectId(customer?._id) } };
      const { modifiedCount }: UpdateOne = await UpdateOneDocument(
        CollectionName.User,
        {
          lead_id: new ObjectId(lead._id),
          internalstatus: 1,
          externalstatus: 1,
        },
        params,
        {}
      );
      if (!modifiedCount) {
        return {
          code: statusCode.InternalServer,
          response: { status: 0, message: 'Error while syncing the account.' },
        };
      }
      updateSharedNewsletter(
        lead.business_email,
        { isLead: true, isCustomer: true },
        context
      );
      return {
        code: statusCode.Success,
        response: { status: 1, message: 'Customer created successfully.' },
      };
    } else {
      if (customer?._id) {
        const { matchedCount, modifiedCount }: UpdateMany =
          await UpdateManyDocument(
            CollectionName.User,
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
            response: {
              status: 0,
              message: 'Error while unsyncing the account.',
            },
          };
        }
        const usercredential: UpdateMany = await UpdateManyDocument(
          CollectionName.UserCred,
          { leadid: { $eq: new ObjectId(lead._id) } },
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
        if (usercredential.matchedCount && !usercredential.modifiedCount) {
          return {
            code: statusCode.InternalServer,
            response: {
              status: 0,
              message: 'Error while unsyncing the account.',
            },
          };
        }
        const userrole: UpdateMany = await UpdateManyDocument(
          CollectionName.UserRole,
          { leadid: { $eq: new ObjectId(lead._id) } },
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
        if (userrole.matchedCount && !userrole.modifiedCount) {
          return {
            code: statusCode.InternalServer,
            response: {
              status: 0,
              message: 'Error while unsyncing the account.',
            },
          };
        }
      }
      const insertData: User = {
        _id: new ObjectId(),
        firstname: lead.name,
        email: lead.business_email,
        mobile: lead.mobile,
        emailinvite: false,
        twofaenrollment: false,
        lead_id: new ObjectId(lead._id),
        ...(customer?._id && { customer_id: new ObjectId(customer._id) }),
        internalstatus: 1,
        externalstatus: 1,
        createdon: Date.now(),
        createdby: context.loginUserId,
        modifiedon: Date.now(),
        modifiedby: context.loginUserId,
      };
      const { insertedId }: InsertOne = await InsertOneDocument(
        CollectionName.User,
        insertData
      );
      if (insertedId) {
        const isCustomer = !!customer?._id;
        updateSharedNewsletter(
          lead.business_email,
          { isLead: true, isCustomer },
          context
        );
        createRole(lead._id as ObjectId, insertedId, context);
        const inviteResponse = await sendInviteLink(insertedId, lead);
        if (inviteResponse.code === statusCode.Success) {
          inviteResponse.response.message = `${
            customer?._id ? 'Customer' : 'Subscription'
          } created successfully`;
        }
        return inviteResponse;
      } else {
        return {
          code: statusCode.InternalServer,
          response: { status: 0, message: 'Error in creating user' },
        };
      }
    }
  } catch (e) {
    return {
      code: statusCode.InternalServer,
      response: { status: 0, message: 'Server error' },
    };
  }
}

function updateSharedNewsletter(
  email: string,
  { isLead, isCustomer }: { isLead: boolean; isCustomer: boolean },
  context: { loginUserId: ObjectId }
): void {
  const insertData: NewsLetter = {
    email,
    emailvalidated: false,
    optedout: false,
    is_lead: isLead,
    is_customer: isCustomer,
    internalstatus: 1,
    externalstatus: 1,
    createdon: Date.now(),
    createdby: context.loginUserId,
    modifiedon: Date.now(),
    modifiedby: context.loginUserId,
  };
  const params = { $set: insertData };
  UpdateOneDocument(CollectionName.NewsLetter, { email }, params, {
    upsert: true,
  })
    .then((data) => data)
    .catch((e) => e);
}

function createRole(
  leadid: ObjectId,
  userid: ObjectId,
  context: { loginUserId: ObjectId }
): void {
  UpdateOneDocument(
    CollectionName.Role,
    { name: UserRoleName.AccountOwner, leadid: { $eq: new ObjectId(leadid) } },
    { $set: newRoles(leadid, UserRoleName.AccountOwner, context) },
    {
      upsert: true,
    }
  )
    .then(({ upsertedCount, upsertedId }: UpdateOne) => {
      if (upsertedCount && upsertedId) {
        newUserRole(userid, leadid, upsertedId, context);
      } else {
        GetOneDocument(
          CollectionName.Role,
          {
            name: UserRoleName.AccountOwner,
            leadid: { $eq: new ObjectId(leadid) },
          },
          { _id: 1 }
        )
          .then(({ _id }: Role) => {
            newUserRole(userid, leadid, _id as ObjectId, context);
          })
          .catch((e) => e);
      }
    })
    .catch((e) => e);
  const ROLES = [
    UserRoleName.SuperAdmin,
    UserRoleName.UserAdmin,
    UserRoleName.BillingAdmin,
    UserRoleName.User,
  ];
  const executeQuery = _.reduce(
    ROLES,
    (query: any[], role: string) => {
      const params = { $set: newRoles(leadid, role, context) };
      query.push(
        UpdateOneDocument(
          CollectionName.Role,
          { name: role, leadid: { $eq: new ObjectId(leadid) } },
          params,
          {
            upsert: true,
          }
        )
      );
      return query;
    },
    []
  );
  Promise.allSettled(executeQuery)
    .then((data) => data)
    .catch((e) => e);
}

function newRoles(
  leadid: ObjectId,
  name: string,
  context: { loginUserId: ObjectId }
): Role {
  return {
    name,
    leadid,
    internalstatus: 1,
    externalstatus: 1,
    createdon: Date.now(),
    createdby: context.loginUserId,
    modifiedon: Date.now(),
    modifiedby: context.loginUserId,
  };
}

function newUserRole(
  userid: ObjectId,
  leadid: ObjectId,
  roleid: ObjectId,
  context: { loginUserId: ObjectId }
): void {
  InsertOneDocument(CollectionName.UserRole, {
    userid: new ObjectId(userid),
    leadid: new ObjectId(leadid),
    roleid: new ObjectId(roleid),
    internalstatus: 1,
    externalstatus: 1,
    createdon: Date.now(),
    createdby: context.loginUserId,
    modifiedon: Date.now(),
    modifiedby: context.loginUserId,
  })
    .then((data) => data)
    .catch((e) => e);
}
