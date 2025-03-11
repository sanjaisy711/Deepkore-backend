import { body, param } from 'express-validator';
import { Request, Response, Router } from 'express';
import { ReplySuccess } from '../../types/responseType';
import { handleCatchError } from '../../helper/errorHandler';
import { statusCode } from '../../types/internalType';
import {
  getLead,
  getLeadList,
  getLeadOwner,
  inviteLead,
  newLead,
  newLeadStatus,
  updateLead,
  getAllActiveLead,
} from '../controller/lead';
import { ensureAuthorized, isUserValid } from '../helper/authHandler';
import { checkListStatus } from '../../helper/middlewares';
import { fetchUserById } from '../controller/lead';
import { fetchLeadStatusById } from '../controller/lead';
import { gmailTransporter, mailDetails } from '../../helper/mail';

const leadRouter: Router = Router();

try {
  leadRouter.post(
    '/',
    [
      body('name', 'Name is required').not().isEmpty(),
      body('business_email', 'Email is required').isEmail().not().isEmpty(),
      body('mobile', 'Mobile Number is required').not().isEmpty(),
      body('country', 'Country is required').not().isEmpty(),
    ],
    (req: Request, res: Response) => {
      newLead(req)
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
  leadRouter.patch(
    '/',
    ensureAuthorized,
    isUserValid,
    [
      body('_id', 'Id is required').not().isEmpty().isMongoId(),
      body('name', 'Name is required').not().isEmpty(),
      body('business_email', 'Email is required').isEmail().not().isEmpty(),
      body('mobile', 'Mobile Number is required').not().isEmpty(),
      body('country', 'Country is required').not().isEmpty(),
    ],
    (req: Request, res: Response) => {
      updateLead(req)
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
  leadRouter.get(
    '/:id',
    ensureAuthorized,
    isUserValid,
    [param('id', 'Id is required').not().isEmpty().isMongoId()],
    (req: Request, res: Response) => {
      getLead(req)
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
  leadRouter.get(
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
      getLeadList(req)
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
  leadRouter.post(
    '/invite',
    ensureAuthorized,
    isUserValid,
    [body('id', 'Id is required').not().isEmpty().isMongoId()],
    (req: Request, res: Response) => {
      inviteLead(req)
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
  leadRouter.post(
    '/updatestatus',
    ensureAuthorized,
    isUserValid,
    [
      body('oldleadstatus_id', 'Lead is required').not().isEmpty().isMongoId(),
      body('lead_id', 'Lead is required').not().isEmpty().isMongoId(),
      body('dzitrauser_id', 'User is required').not().isEmpty().isMongoId(),
      body('leadstatus_id', 'Status is required').not().isEmpty().isMongoId(),
      body('comments', 'Comments is required').not().isEmpty(),
      body('updateddate', 'Date is required').not().isEmpty(),
    ],
    (req: Request, res: Response) => {
      const userId = req.body.dzitrauser_id;
      const leadstatus_id = req.body.leadstatus_id;
      const oldleadstatus_id = req.body.oldleadstatus_id;
      const userComments = req.body.comments;
      const updatedDate = req.body.updateddate;

      //Date format
      const dateObj = new Date(updatedDate);
    const formattedDate = `${String(dateObj.getDate()).padStart(2, '0')}/${
        String(dateObj.getMonth() + 1).padStart(2, '0')}/${
        dateObj.getFullYear()}`;
      newLeadStatus(req)
        .then((result: ReplySuccess) => {
                  // Handle lead status
                  fetchLeadStatusById(leadstatus_id,oldleadstatus_id)
                  .then((lead) => {
                                // Handle user fetching 
                                fetchUserById(userId)
                                .then((user) => {
                                  if (user?.name) {
                                    const updatedMailDetails = {
                                      ...mailDetails,
                                      subject: `Lead Status Updated`,
                                      text: `Hi,

                                      We are pleased to inform you that the status of your lead has been changed.
                                      
                                      Status:          ${lead?.oldName}
                                      Updated Status:  ${lead?.name}
                                      Date:            ${formattedDate}
                                      Changed By:      ${user.email}
                                      Comments:        ${userComments}
                                      
                                      Note:
                                      This is an auto-generated mail.
                                       `,
                                    };

                                    // Send email using the transporter
                                    gmailTransporter.sendMail(updatedMailDetails, function (err: any, data: any) {
                                      if (err) {
                                        console.log('Error Occurs during sending email: ', err);
                                        res.status(statusCode.InternalServer).json({
                                          status: 0,
                                          message: handleCatchError(err),
                                        });
                                      } else {
                                        console.log(`Email Sent Successfully`);
                                        res.status(result.code).json(result.response);
                                      }
                                    });
                                  } else {
                                    console.log('No email found');
                                    res.status(statusCode.PageNotFound).json({ status: 0, message: 'No email found for the lead' });
                                  }
                                })
                                .catch((err) => {
                                  console.error('Error capturing email:', err.message);
                                  res.status(statusCode.InternalServer).json({ status: 0, message: 'Error fetching email' });
                                });  
                  })
                  .catch((err) => {
                    console.error('Error fetching lead status:', err.message);
                    res.status(statusCode.InternalServer).json({
                      status: 0,
                      message: 'Error fetching lead status',
                    });
                  });
        })
        .catch((err) => {
          res
            .status(statusCode.InternalServer)
            .json({ status: 0, message: handleCatchError(err) });
        });
    }
  );
  leadRouter.get(
    '/status/:id',
    ensureAuthorized,
    isUserValid,
    [param('id', 'Id is required').not().isEmpty().isMongoId()],
    (req: Request, res: Response) => {
      getLeadOwner(req)
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
  leadRouter.get(
    '/all/active',
    ensureAuthorized,
    isUserValid,
    (req: Request, res: Response) => {
      getAllActiveLead(req)
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
  console.error('error in config lead router', e);
}
export default leadRouter;
