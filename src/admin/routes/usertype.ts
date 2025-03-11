import { body, param } from 'express-validator';
import { ensureAuthorized, isUserValid } from '../helper/authHandler';
import { Request, Response, Router } from 'express';
import { ReplySuccess } from '../../types/responseType';
import { statusCode } from '../../types/internalType';
import { handleCatchError } from '../../helper/errorHandler';
import { checkListStatus } from '../../helper/middlewares';
import {
  getAllActiveUserType,
  getUserType,
  getUserTypeList,
  newUserType,
  updateUserType,
} from '../controller/usertype';

const usertypeRouter: Router = Router();

try {
  usertypeRouter.post(
    '/',
    ensureAuthorized,
    isUserValid,
    [body('name', 'Name is required').not().isEmpty()],
    (req: Request, res: Response) => {
      newUserType(req)
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
  usertypeRouter.patch(
    '/',
    ensureAuthorized,
    isUserValid,
    [
      body('_id', 'Id is required').not().isEmpty().isMongoId(),
      body('name', 'Name is required').not().isEmpty(),
    ],
    (req: Request, res: Response) => {
      updateUserType(req)
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
  usertypeRouter.get(
    '/:id',
    ensureAuthorized,
    isUserValid,
    [param('id', 'Id is required').not().isEmpty().isMongoId()],
    (req: Request, res: Response) => {
      getUserType(req)
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
  usertypeRouter.get(
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
      getUserTypeList(req)
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
  usertypeRouter.get(
    '/all/active',
    ensureAuthorized,
    isUserValid,
    (req: Request, res: Response) => {
      getAllActiveUserType(req)
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
  console.error('error in config usertype router', e);
}
export default usertypeRouter;
