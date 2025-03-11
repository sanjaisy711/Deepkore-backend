import { Request, Response, Router } from 'express';
import { body } from 'express-validator';
import { GetOneDocument, UpdateOneDocument } from '../../connector/mongodb';
import { isObjectId, jwtSigninToken, validPassword } from '../../helper/shared';
import { User, UserHash } from '../../types/collection/user';
import { CryptoReqRes, statusCode } from '../../types/internalType';
import { CollectionName, UpdateOne } from '../../types/mongoType';
import ENV_PROP from '../../config/config';
import { Subscription } from '../../types/collection/subscription';
import { ObjectId } from 'mongodb';
import { encrypt } from '../../helper/cryptoHelper';
import { checkUserRole } from '../helper/authHandler';

const authRouter: Router = Router();
try {
  authRouter.post(
    '/signin',
    [
      body('username', 'Username is required!').not().isEmpty(),
      body('password', 'Password is required').not().isEmpty(),
    ],
    (req: Request, res: Response): void => {
      (async () => {
        const user = (await GetOneDocument(
          CollectionName.User,
          {
            $or: [{ email: { $eq: req.body.username } }],
            internalstatus: 1,
            externalstatus: 1,
          },
          { _id: 1, email: 1, firstname: 1, lead_id: 1, iv: 1 }
        )) as User;
        const role = await checkUserRole(user._id);
        if (!role) {
          return res
            .status(statusCode.Unauthorized)
            .json({ status: 0, message: 'Account has no access to sign-in' });
        }
        if (!user || !isObjectId(user._id)) {
          res
            .status(statusCode.BadRequest)
            .json({ status: 0, message: 'Invalid Account Details' });
        } else {
          const userHash = (await GetOneDocument(
            CollectionName.UserCred,
            {
              userid: { $eq: user._id },
              internalstatus: 1,
              externalstatus: 1,
            },
            { _id: 1, hash: 1 }
          )) as UserHash;
          if (!userHash || !isObjectId(userHash._id)) {
            res
              .status(statusCode.BadRequest)
              .json({ status: 0, message: 'Invalid Account Details' });
          } else {
            if (validPassword(req.body.password, userHash.hash)) {
              res.status(statusCode.BadRequest).json({
                status: 0,
                message:
                  'You are not authorized to sign in. Verify that you are using valid credentials.',
              });
            } else {
              const now = Date.now();
              const subscription = (await GetOneDocument(
                CollectionName.Subscription,
                {
                  lead_id: new ObjectId(user.lead_id),
                  internalstatus: 1,
                  externalstatus: 1,
                  startdate: { $lte: now },
                  enddate: { $gte: now },
                },
                { enddate: 1, maxenddate: 1, _id: 1 }
              )) as Subscription;
              if (!subscription?._id) {
                return res.status(statusCode.BadRequest).json({
                  status: 0,
                  message:
                    'You are not authorized to sign in. Verify that you have an active plan.',
                });
              }
              const { iv, content }: CryptoReqRes = encrypt(
                subscription.enddate.toString(),
                user.iv
              );
              const cipherRole: CryptoReqRes = encrypt(role, iv);
              const { modifiedCount }: UpdateOne = await UpdateOneDocument(
                CollectionName.User,
                { _id: new ObjectId(user._id) },
                { $set: { iv } },
                {}
              );
              if (!modifiedCount) {
                return res.status(statusCode.InternalServer).json({
                  status: 0,
                  message: 'Something went wrong, try again later...!',
                });
              }
              const authHeader: string = jwtSigninToken(
                {
                  id: user._id,
                  username: user.email,
                  sub: 'cap',
                  time: content,
                  role: cipherRole.content,
                },
                ENV_PROP.CAP_SECRET_KEY,
                ENV_PROP.CAP_JWT_EXPIRES
              );
              res.status(statusCode.Success).json({
                username: user.email,
                id: user._id,
                token: authHeader,
              });
            }
          }
        }
      })().catch((_err) => {
        res
          .status(statusCode.InternalServer)
          .json({ status: 0, message: 'Server error' });
      });
    }
  );
} catch (e) {
  console.error('error in CAP auth router', e);
}
export default authRouter;
