import { Request, Response, Router } from 'express';
import { body, param } from 'express-validator';
import { handleCatchError } from '../../helper/errorHandler';
import { statusCode } from '../../types/internalType';
import { ReplySuccess } from '../../types/responseType';
import {
  newCustomer,
  getCustomer,
  getCustomerList,
} from '../controller/customer';
import { ensureAuthorized, isUserValid } from '../helper/authHandler';
import { checkListStatus } from '../../helper/middlewares';
import { gmailTransporter, mailDetails } from '../../helper/mail';
//import { fetchEmailById } from '../controller/customer'
const customerRouter: Router = Router();

try {
  customerRouter.post(
    '/',
    ensureAuthorized,
    isUserValid,
    [
      body('planid', 'Plan is required').not().isEmpty().isMongoId(),
      body('lead_id', 'Lead is required').not().isEmpty().isMongoId(),
      body('dzitrauser_id', 'User is required').not().isEmpty().isMongoId(),
      body('onboarded_date', 'Onboard date is required').not().isEmpty(),
      body('subscription_validity', 'Validity date is required')
        .not()
        .isEmpty(),
      body('remind_before', 'Remind before is required').not().isEmpty(),
      body('purchase_id', 'Remind before is required').not().isEmpty(),
    ],
    (req: Request, res: Response) => {
      newCustomer(req)
        .then((result: ReplySuccess) => {
              const updatedMailDetails = {
                ...mailDetails, 
                subject: 'Welcome to Our Service!', 
                text: `Hi,

                We are pleased to inform you that the status of your lead has been changed.
                
                
                Note:
                This is an auto-generated mail.
                 `,
              };
              
              gmailTransporter.sendMail(
                updatedMailDetails,
                function (err: any, data: any) {
                  if (err) {
                    console.log('Error Occurs: ', err);
                    res
                      .status(statusCode.InternalServer)
                      .json({ status: 0, message: handleCatchError(err) });
                  } else {
                    res.status(result.code).json(result.response);
                  }
                }
              );
        })
        .catch((err) => {
          res
            .status(statusCode.InternalServer)
            .json({ status: 0, message: handleCatchError(err) });
        });
    }
  );
  customerRouter.get(
    '/:id',
    ensureAuthorized,
    isUserValid,
    [param('id', 'Id is required').not().isEmpty().isMongoId()],
    (req: Request, res: Response) => {
      getCustomer(req)
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
  customerRouter.get(
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
      getCustomerList(req)
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
  console.error('error in config customer router', e);
}
export default customerRouter;
