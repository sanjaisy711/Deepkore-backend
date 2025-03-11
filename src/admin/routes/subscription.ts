import { Request, Response, Router } from 'express';
import { body, param } from 'express-validator';
import { handleCatchError } from '../../helper/errorHandler';
import { statusCode } from '../../types/internalType';
import { ReplySuccess } from '../../types/responseType';
import {
  getSubsciption,
  getSubscriptionList,
  newSubscription,
} from '../controller/subscription';
import { ensureAuthorized, isUserValid } from '../helper/authHandler';
import { checkListStatus } from '../../helper/middlewares';

const subscriptionRouter: Router = Router();

try {
  subscriptionRouter.post(
    '/',
    ensureAuthorized,
    isUserValid,
    [
      body('planid', 'Plan is required').not().isEmpty().isMongoId(),
      body('lead_id', 'Lead is required').not().isEmpty().isMongoId(),
      body('startdate', 'Start date is required').not().isEmpty(),
      body('enddate', 'End date is required').not().isEmpty(),
      body('maxenddate', 'Maximum End Date is required').not().isEmpty(),
    ],
    (req: Request, res: Response) => {
      newSubscription(req)
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

  subscriptionRouter.get(
    '/:id',
    ensureAuthorized,
    isUserValid,
    [param('id', 'Id is required').not().isEmpty().isMongoId()],
    (req: Request, res: Response) => {
      getSubsciption(req)
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
  subscriptionRouter.get(
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
      getSubscriptionList(req)
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
  console.error('error in config subscription router', e);
}
export default subscriptionRouter;
