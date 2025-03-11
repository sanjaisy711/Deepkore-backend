import { Request, Response, Router } from 'express';
import { body, param } from 'express-validator';
import {
  getUserRole,
  newUserRole,
  updateUserRole,
} from '../controller/userrole';
import { ensureAuthorized, isUserValid } from '../helper/authHandler';
import { handleCatchError } from '../../helper/errorHandler';
import { statusCode } from '../../types/internalType';
import { ReplySuccess } from '../../types/responseType';

const userRoleRouter: Router = Router();
try {
  userRoleRouter.post(
    '/',
    ensureAuthorized,
    isUserValid,
    [
      body('userid', 'User is required').not().isEmpty().isMongoId(),
      body('roleid', 'Role is required').not().isEmpty().isMongoId(),
    ],
    (req: Request, res: Response) => {
      newUserRole(req)
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
  userRoleRouter.patch(
    '/',
    ensureAuthorized,
    isUserValid,
    [
      body('_id', 'Id is required').not().isEmpty().isMongoId(),
      body('userid', 'User is required').not().isEmpty().isMongoId(),
      body('roleid', 'Role is required').not().isEmpty().isMongoId(),
    ],
    (req: Request, res: Response) => {
      updateUserRole(req)
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
  userRoleRouter.get(
    '/:userid',
    ensureAuthorized,
    isUserValid,
    [param('userid', 'Id is required').not().isEmpty().isMongoId()],
    (req: Request, res: Response) => {
      getUserRole(req)
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
  console.error('error in config userrole router', e);
}
export default userRoleRouter;
