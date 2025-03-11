import { body, param } from 'express-validator';
import { ensureAuthorized, isUserValid } from '../helper/authHandler';

import { newUser, updateUser, getUser, getUserList } from '../controller/user';
import { Request, Response, Router } from 'express';
import { ReplySuccess } from '../../types/responseType';
import { statusCode } from '../../types/internalType';
import { handleCatchError } from '../../helper/errorHandler';
import { checkListStatus } from '../../helper/middlewares';

const userRouter: Router = Router();
try {
  userRouter.post(
    '/',
    ensureAuthorized,
    isUserValid,
    [
      body('lead_id', 'Lead is required').not().isEmpty().isMongoId(),
      body('emailinvite').toBoolean(),
      body('twofaenrollment').toBoolean(),
    ],
    (req: Request, res: Response) => {
      newUser(req)
        .then((result: ReplySuccess) => {
          res.status(result.code).json(result.response);
        })
        .catch((err) => {
          res
            .status(statusCode.InternalServer)
            .json({ status: 0, message: handleCatchError(err) });
        });
    }
  );
  userRouter.patch(
    '/',
    ensureAuthorized,
    isUserValid,
    [
      body('_id', 'Id is required').not().isEmpty().isMongoId(),
      body('emailinvite').toBoolean(),
      body('twofaenrollment').toBoolean(),
    ],
    (req: Request, res: Response) => {
      updateUser(req)
        .then((result: ReplySuccess) => {
          res.status(result.code).json(result.response);
        })
        .catch((err) => {
          res
            .status(statusCode.InternalServer)
            .json({ status: 0, message: handleCatchError(err) });
        });
    }
  );
  userRouter.get(
    '/:id',
    ensureAuthorized,
    isUserValid,
    [param('id', 'Id is required').not().isEmpty().isMongoId()],
    (req: Request, res: Response) => {
      getUser(req)
        .then((result: ReplySuccess) => {
          res.status(result.code).json(result.response);
        })
        .catch((err) => {
          res
            .status(statusCode.InternalServer)
            .json({ status: 0, message: handleCatchError(err) });
        });
    }
  );
  userRouter.get(
    '/:list/:sort/:order/:page/:size',
    ensureAuthorized,
    isUserValid,
    checkListStatus,
    [
      param('sort', 'Sort key is required').not().isEmpty(),
      param('order', 'Sort order is required').not().isEmpty().isNumeric(),
      param('page', 'Page is required').not().isEmpty().isNumeric(),
      param('size', 'Size is required').not().isEmpty().isNumeric(),
    ],
    (req: Request, res: Response) => {
      getUserList(req)
        .then((result: ReplySuccess) => {
          res.status(result.code).json(result.response);
        })
        .catch((err) => {
          res
            .status(statusCode.InternalServer)
            .json({ status: 0, message: handleCatchError(err) });
        });
    }
  );
} catch (e) {
  console.error('error in config user router', e);
}
export default userRouter;
