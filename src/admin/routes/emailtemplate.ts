import { Request, Response, Router } from 'express';
import { body, param } from 'express-validator';
import {
  getEmailTemplate,
  getEmailTemplateList,
  newEmailTemplate,
  updateEmailTemplate,
} from '../controller/emailtemplate';
import { ensureAuthorized, isUserValid } from '../helper/authHandler';
import { handleCatchError } from '../../helper/errorHandler';
import { checkListStatus } from '../../helper/middlewares';
import { statusCode } from '../../types/internalType';
import { ReplySuccess } from '../../types/responseType';

const emailtemplateRouter: Router = Router();

try {
  emailtemplateRouter.post(
    '/',
    ensureAuthorized,
    isUserValid,
    [
      body('name', 'Name is required').not().isEmpty(),
      body('sender_name', 'Sender Name is required').not().isEmpty(),
      body('sender', 'Sender is required').not().isEmpty().isEmail(),
      body('subject', 'Please enter email subject').not().isEmpty(),
      body('content', 'Please enter email content').not().isEmpty(),
    ],
    (req: Request, res: Response) => {
      newEmailTemplate(req)
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
  emailtemplateRouter.patch(
    '/',
    ensureAuthorized,
    isUserValid,
    [
      body('_id', 'Id is required').not().isEmpty().isMongoId(),
      body('name', 'Name is required').not().isEmpty(),
      body('sender_name', 'Sender Name is required').not().isEmpty(),
      body('sender', 'Sender is required').not().isEmpty().isEmail(),
      body('subject', 'Please enter email subject').not().isEmpty(),
      body('content', 'Please enter email content').not().isEmpty(),
    ],
    (req: Request, res: Response) => {
      updateEmailTemplate(req)
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
  emailtemplateRouter.get(
    '/:id',
    ensureAuthorized,
    isUserValid,
    [param('id', 'Id is required').not().isEmpty().isMongoId()],
    (req: Request, res: Response) => {
      getEmailTemplate(req)
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
  emailtemplateRouter.get(
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
      getEmailTemplateList(req)
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
  console.error('error in config emailtemplate router', e);
}
export default emailtemplateRouter;
