import { Request, Response, Router } from 'express';
import { body } from 'express-validator';
import { handleCatchError } from '../../helper/errorHandler';
import { statusCode } from '../../types/internalType';
import { ReplySuccess } from '../../types/responseType';
import { checkLinkExpiry, inviteSubmit } from '../controller/lead';
import { ensureAuthorized } from '../helper/authHandler';
import {
  newLeadSignup,
  scheduleDemo,
  plans,
  contactUs,
} from '../controller/lead';
// import { gmailTransporter } from '../../helper/mail';
import { sendEmail } from '../../helper/mail';

export const leadRouter: Router = Router();
export const leadSignupRouter: Router = Router();

const date = new Date();

let day = date.getDate();
let month = date.getMonth() + 1;
let year = date.getFullYear();
let currentDate = `${day}-${month}-${year}`;

try {
  leadRouter.get(
    '/check/link',
    ensureAuthorized,
    (req: Request, res: Response) => {
      checkLinkExpiry(req)
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
    '/submit/link',
    ensureAuthorized,
    [body('password', 'Password is required').not().isEmpty()],
    (req: Request, res: Response) => {
      inviteSubmit(req)
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

  //lead signup
  leadSignupRouter.post(
    '/leadsignup',
    [
      body('name', 'Name is required').not().isEmpty(),
      body('business_email', 'Email is required').isEmail().not().isEmpty(),
      body('mobile', 'Mobile Number is required').not().isEmpty(),
      body('company_name', 'Company Name is required').not().isEmpty(),
    ],
    async (req: Request, res: Response) => {
      try {
        const result = await newLeadSignup(req);
        console.log(result.code);

        const mailDetails = {
          subject: 'New Lead signup',
          text: `Hi,
            New Lead signup from Get Started.
                Name: ${req.body.name}
                Email: ${req.body.business_email}
                Mobile: ${req.body.mobile}
                Company Name: ${req.body.company_name}
            
            
            Note:
            This is an auto-generated mail.
             `,
        };

        if (result.code !== 422) {
          const emailResult = await sendEmail(
            mailDetails.subject,
            mailDetails.text
          );
          if (emailResult.error) {
            console.log('Error Occurs: ', emailResult.error);
            res.status(statusCode.InternalServer).json({
              status: 0,
              message: handleCatchError(emailResult.error),
            });
          } else {
            res.status(result.code).json(result.response);
          }
        } else {
          res.status(result.code).json(result.response);
        }
        //res.status(result.code).json(result.response);
      } catch (err) {
        res
          .status(statusCode.InternalServer)
          .json({ status: 0, message: handleCatchError(err) });
      }
    }
  );

  //Pricing
  leadRouter.post(
    '/plans',
    [
      // Validation middleware
      body('name', 'Name is required').not().isEmpty(),
      body('business_email', 'Email is required and must be valid')
        .isEmail()
        .not()
        .isEmpty(),
      body('mobile', 'Mobile Number is required').not().isEmpty(),
      body('company_name', 'Company Name is required').not().isEmpty(),
      body('plan', 'Plan is required').not().isEmpty(),
    ],
    async (req: Request, res: Response): Promise<void> => {
      try {
        console.log('plan endpoint hit');
        const result = await plans(req);

        const plan = req.body.plan;
        const mailDetails = {
          subject: 'New Lead - Plan',
          text: `New lead generation via pricing in our
                Name: ${req.body.name}
                Email: ${req.body.business_email}
                Mobile: ${req.body.mobile}
                Company Name: ${req.body.company_name}
                plan: ${plan}


          Note:
          This is an auto-generated mail.`,
        };

        // Handle result
        if (result.code !== 422) {
          const emailResult = await sendEmail(
            mailDetails.subject,
            mailDetails.text
          );
          if (emailResult.success) {
            res.status(result.code).json(result.response);
          } else {
            console.error('Failed to send email:', emailResult.error);
            res
              .status(statusCode.InternalServer)
              .json({ status: 0, message: 'Email failed to send.' });
          }
        } else {
          res.status(result.code).json(result.response);
        }
      } catch (err) {
        console.error('Error in plans endpoint:', err);
        res
          .status(statusCode.InternalServer)
          .json({ status: 0, message: handleCatchError(err) });
      }
    }
  );

  leadRouter.post(
    '/scheduledemo',
    [
      // Validation middleware for request body
      body('business_email', 'Email is required and must be valid')
        .isEmail()
        .not()
        .isEmpty(),
    ],
    async (req: Request, res: Response): Promise<void> => {
      try {
        // Schedule demo logic
        const result = await scheduleDemo(req);

        // Prepare email details
        const mailDetails = {
          subject: 'New Lead requested via Schedule demo',
          text: `New lead generation. Email: ${req.body.business_email}.
            
          Note:
          This is an auto-generated mail.`,
        };

        // Handle valid scheduleDemo results
        if (result.code !== 422) {
          // Send email
          const emailResult = await sendEmail(
            mailDetails.subject,
            mailDetails.text
          );

          if (emailResult.success) {
            res.status(result.code).json(result.response); // Success response
          } else {
            console.error('Failed to send email:', emailResult.error);
            res
              .status(statusCode.InternalServer)
              .json({ status: 0, message: 'Email failed to send.' });
          }
        } else {
          res.status(result.code).json(result.response); // Validation error
        }
      } catch (err) {
        console.error('Error in scheduling demo:', err);
        res
          .status(statusCode.InternalServer)
          .json({ status: 0, message: 'An unexpected error occurred.' });
      }
    }
  );

  //contact us
  leadRouter.post(
    '/contactus',
    [
      // Validation middleware for the request body
      body('name', 'Name is required').not().isEmpty(),
      body('business_email', 'Email is required and must be valid')
        .isEmail()
        .not()
        .isEmpty(),
      body('mobile', 'Mobile Number is required').not().isEmpty(),
      body('country', 'Country is required').not().isEmpty(),
      body('company_name', 'Company Name is required').not().isEmpty(),
      body(
        'brief_business_requirement',
        'Brief business requirement is required'
      )
        .not()
        .isEmpty(),
    ],
    async (req: Request, res: Response): Promise<void> => {
      try {
        // Handle the 'contactUs' logic
        const result = await contactUs(req);

        // Prepare email details
        const mailDetails = {
          subject: 'New Lead requested via Contact Us',
          text: `New lead generation:
                Name: ${req.body.name}
                Email: ${req.body.business_email}
                Mobile: ${req.body.mobile}
                Country: ${req.body.country}
                Company Name: ${req.body.company_name}
                Business Requirement: ${req.body.brief_business_requirement}

                
                Note:
                This is an auto-generated mail.`,
        };

        // Send email if request is successful
        if (result.code !== 422) {
          const emailResult = await sendEmail(
            mailDetails.subject,
            mailDetails.text
          );
          console.log(emailResult.success);
          if (emailResult.success) {
            res.status(result.code).json(result.response);
          } else {
            console.error('Failed to send email:', emailResult.error);
            res
              .status(statusCode.InternalServer)
              .json({ status: 0, message: 'Email failed to send.' });
          }
        } else {
          res.status(result.code).json(result.response);
        }
      } catch (err) {
        console.error('Error in contact us:', err);
        res
          .status(statusCode.InternalServer)
          .json({ status: 0, message: handleCatchError(err) });
      }
    }
  );
} catch (e) {
  console.error('error in site lead router', e);
}
// export default leadRouter;
