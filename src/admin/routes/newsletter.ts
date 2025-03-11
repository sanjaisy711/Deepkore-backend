import { body, param } from 'express-validator';
import { ensureAuthorized, isUserValid } from '../helper/authHandler';
import { Request, Response, Router } from 'express';
import { ReplySuccess } from '../../types/responseType';
import { statusCode } from '../../types/internalType';
import { handleCatchError } from '../../helper/errorHandler';
import {
  getNewsletter,
  getNewsletterList,
  newNewsletter,
  updateNewsletter,
} from '../controller/newsletter';
import { checkListStatus } from '../../helper/middlewares';

const newsletterRouter: Router = Router();

try {
  newsletterRouter.post(
    '/',
    ensureAuthorized,
    isUserValid,
    [
      body('email', 'Email is required').not().isEmpty().isEmail(),
      body('emailvalidated').toBoolean(),
      body('optedout').toBoolean(),
      body('is_lead', 'Type lead is required').not().isEmpty().toBoolean(),
      body('is_customer', 'Type customer is required')
        .not()
        .isEmpty()
        .toBoolean(),
    ],
    (req: Request, res: Response) => {
      newNewsletter(req)
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
  newsletterRouter.patch(
    '/',
    ensureAuthorized,
    isUserValid,
    [
      body('_id', 'Id is required').not().isEmpty().isMongoId(),
      body('email', 'Email is required').not().isEmpty().isEmail(),
      body('emailvalidated').toBoolean(),
      body('optedout').toBoolean(),
      body('is_lead').toBoolean(),
      body('is_customer').toBoolean(),
    ],
    (req: Request, res: Response) => {
      updateNewsletter(req)
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
  newsletterRouter.get(
    '/:id',
    ensureAuthorized,
    isUserValid,
    [param('id', 'Id is required').not().isEmpty().isMongoId()],
    (req: Request, res: Response) => {
      getNewsletter(req)
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
  newsletterRouter.get(
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
      getNewsletterList(req)
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
  console.error('error in config newsletter router', e);
}
export default newsletterRouter;
