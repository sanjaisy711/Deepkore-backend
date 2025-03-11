import { Request, Response, Router } from 'express';
import { body, param } from 'express-validator';
import { handleCatchError } from '../../helper/errorHandler';
import { statusCode } from '../../types/internalType';
import { ReplySuccess } from '../../types/responseType';
import {
  getRoleList,
  getUserForRole,
  updateUserRole,
} from '../controller/role';
import { capEnsureAuthorized, capIsUserValid } from '../helper/authHandler';

const capRoleRouter: Router = Router();

try {
  capRoleRouter.get(
    '/list/:sort/:order/:page/:size',
    capEnsureAuthorized,
    capIsUserValid,
    [
      param('sort', 'Sort key is required').not().isEmpty(),
      param('order', 'Sort order is required').not().isEmpty().isNumeric(),
      param('page', 'Page is required').not().isEmpty().isNumeric(),
      param('size', 'Size is required').not().isEmpty().isNumeric(),
    ],
    (req: Request, res: Response) => {
      getRoleList(req)
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
  capRoleRouter.get(
    '/user-by-role/:id',
    capEnsureAuthorized,
    capIsUserValid,
    [param('id', 'Role is required').not().isEmpty().isMongoId()],
    (req: Request, res: Response) => {
      getUserForRole(req)
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
  capRoleRouter.post(
    '/user',
    capEnsureAuthorized,
    capIsUserValid,
    [
      body('userids', 'User is required').isArray(),
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
} catch (e) {
  console.error('error in cap setting router', e);
}
export default capRoleRouter;
