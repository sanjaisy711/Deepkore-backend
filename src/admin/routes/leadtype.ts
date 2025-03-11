import { Request, Response, Router } from 'express';
import {
  getAllActiveLeadType,
  getLeadType,
  getLeadTypeList,
  newLeadType,
  updateLeadType,
} from '../controller/leadtype';
import { ensureAuthorized, isUserValid } from '../helper/authHandler';
import { handleCatchError } from '../../helper/errorHandler';
import { statusCode } from '../../types/internalType';
import { ReplySuccess } from '../../types/responseType';
import { body, param } from 'express-validator';
import { checkListStatus } from '../../helper/middlewares';

const leadTypeRouter: Router = Router();
try {
  leadTypeRouter.post(
    '/',
    ensureAuthorized,
    isUserValid,
    [body('name', 'Name is required').not().isEmpty()],
    (req: Request, res: Response) => {
      newLeadType(req)
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
  leadTypeRouter.patch(
    '/',
    ensureAuthorized,
    isUserValid,
    [
      body('_id', 'Id is required').not().isEmpty().isMongoId(),
      body('name', 'Name is required').not().isEmpty(),
    ],
    (req: Request, res: Response) => {
      updateLeadType(req)
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
  leadTypeRouter.get(
    '/:id',
    ensureAuthorized,
    isUserValid,
    [param('id', 'Id is required').not().isEmpty().isMongoId()],
    (req: Request, res: Response) => {
      getLeadType(req)
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
  leadTypeRouter.get(
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
      getLeadTypeList(req)
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
  leadTypeRouter.get(
    '/all/active',
    ensureAuthorized,
    isUserValid,
    (req: Request, res: Response) => {
      getAllActiveLeadType(req)
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
  console.error('error in config leadtype router', e);
}

export default leadTypeRouter;
