import { Request, Response, Router } from 'express';
import { body, param } from 'express-validator';
import { handleCatchError } from '../../helper/errorHandler';
import { statusCode } from '../../types/internalType';
import { ReplySuccess } from '../../types/responseType';
import {
  getAllActivePaidPlan,
  getAllActivePlan,
  getAllActiveTrailPlan,
  getPlan,
  getPlanList,
  newPlan,
  updatePlan,
} from '../controller/plan';
import { ensureAuthorized, isUserValid } from '../helper/authHandler';
import { checkListStatus } from '../../helper/middlewares';

const planRouter: Router = Router();
try {
  planRouter.post(
    '/',
    ensureAuthorized,
    isUserValid,
    [
      body('planname', 'Name is required').not().isEmpty(),
      body('internal_name', 'Internal Name is required').not().isEmpty(),
      body('usercount', 'User Count is required').not().isEmpty().isNumeric(),
      body('dayscount', 'Days Count is required').not().isEmpty().isNumeric(),
      body('price', 'Price is required').not().isEmpty().isNumeric(),
    ],
    (req: Request, res: Response) => {
      newPlan(req)
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
  planRouter.patch(
    '/',
    ensureAuthorized,
    isUserValid,
    [
      body('_id', 'Id is required').not().isEmpty().isMongoId(),
      body('planname', 'Name is required').not().isEmpty(),
      body('internal_name', 'Internal Name is required').not().isEmpty(),
      body('usercount', 'User Count is required').not().isEmpty().isNumeric(),
      body('dayscount', 'Days Count is required').not().isEmpty().isNumeric(),
      body('price', 'Price is required').not().isEmpty().isNumeric(),
    ],
    (req: Request, res: Response) => {
      updatePlan(req)
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
  planRouter.get(
    '/:id',
    ensureAuthorized,
    isUserValid,
    [param('id', 'Id is required').not().isEmpty().isMongoId()],
    (req: Request, res: Response) => {
      getPlan(req)
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
  planRouter.get(
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
      getPlanList(req)
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
  planRouter.get(
    '/all/active',
    ensureAuthorized,
    isUserValid,
    (req: Request, res: Response) => {
      getAllActivePlan(req)
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
  planRouter.get(
    '/all/active/trial',
    ensureAuthorized,
    isUserValid,
    (req: Request, res: Response) => {
      getAllActiveTrailPlan(req)
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
  planRouter.get(
    '/all/active/paid',
    ensureAuthorized,
    isUserValid,
    (req: Request, res: Response) => {
      getAllActivePaidPlan(req)
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
  console.error('error in config plan router', e);
}

export default planRouter;
