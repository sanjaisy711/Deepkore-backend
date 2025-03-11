import { Request, Response, Router } from 'express';
import { body, param } from 'express-validator';
import {
  getDzitraUserRole,
  newDzitraUserRole,
  updateDzitraUserRole,
} from '../controller/dzitrauserrole';
import { ensureAuthorized, isUserValid } from '../helper/authHandler';
import { handleCatchError } from '../../helper/errorHandler';
import { statusCode } from '../../types/internalType';
import { ReplySuccess } from '../../types/responseType';

const dzitraUserRoleRouter: Router = Router();
try {
  dzitraUserRoleRouter.post(
    '/',
    ensureAuthorized,
    isUserValid,
    [
      body('dzitrauser_id', 'User is required').not().isEmpty().isMongoId(),
      body('dzitrarole_id', 'Role is required').not().isEmpty().isMongoId(),
    ],
    (req: Request, res: Response) => {
      newDzitraUserRole(req)
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
  dzitraUserRoleRouter.patch(
    '/',
    ensureAuthorized,
    isUserValid,
    [
      body('_id', 'Id is required').not().isEmpty().isMongoId(),
      body('dzitrauser_id', 'User is required').not().isEmpty().isMongoId(),
      body('dzitrarole_id', 'Role is required').not().isEmpty().isMongoId(),
    ],
    (req: Request, res: Response) => {
      updateDzitraUserRole(req)
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
  dzitraUserRoleRouter.get(
    '/:dzitrauser_id',
    ensureAuthorized,
    isUserValid,
    [param('dzitrauser_id', 'Id is required').not().isEmpty().isMongoId()],
    (req: Request, res: Response) => {
      getDzitraUserRole(req)
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
  console.error('error in config dzitrauserrole router', e);
}
export default dzitraUserRoleRouter;
