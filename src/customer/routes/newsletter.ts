import { Request, Response, Router } from 'express';
import { body } from 'express-validator';
import { handleCatchError } from '../../helper/errorHandler';
import { statusCode } from '../../types/internalType';
import { ReplySuccess } from '../../types/responseType';
import { subscribeUser } from '../controller/newsletter';
import { sendEmail } from '../../helper/mail';

const newsletterRouter: Router = Router();

const date = new Date();

let day = date.getDate();
let month = date.getMonth() + 1;
let year = date.getFullYear();
let currentDate = `${day}-${month}-${year}`;
//console.log(currentDate)

try {
  newsletterRouter.post(
    '/subscribe',
    [body('email', 'Email is required').not().isEmpty().isEmail()],
    async (req: Request, res: Response) => {
      try {
        const result = await subscribeUser(req);
        console.log(result.code);

        const mailDetails = {
          subject: 'New ',
          text: `New lead generation form Newsletter. Email: ${req.body.email}.
            
            Note:
            This is an auto-generated mail.`,
        };
        if (result.code !== 422) {
          const emailResult = await sendEmail(
            mailDetails.subject,
            mailDetails.text
          );
          if (emailResult.error) {
            console.log('Error Occurs: ', emailResult.error);
            res
              .status(statusCode.InternalServer)
              .json({
                status: 0,
                message: handleCatchError(emailResult.error),
              });
          } else {
            res.status(result.code).json(result.response);
          }
        } else {
          res.status(result.code).json(result.response);
        }
      } catch (err) {
        res
          .status(statusCode.InternalServer)
          .json({ status: 0, message: handleCatchError(err) });
      }
    }
  );
} catch (e) {
  console.error('error in site newsletter router', e);
}
export default newsletterRouter;
