import { Request, Response, Router } from 'express';
import { body } from 'express-validator';
import { updateGeneral, updateSMTP } from '../controller/settings';
import { ensureAuthorized, isUserValid } from '../helper/authHandler';
import { handleCatchError } from '../../helper/errorHandler';
import { statusCode } from '../../types/internalType';
import { ReplySuccess } from '../../types/responseType';

const settingsRouter: Router = Router();

try {
  settingsRouter.patch(
    '/general',
    ensureAuthorized,
    isUserValid,
    [
      body('title', 'Title is required').not().isEmpty(),
      body('site_url', 'Site URL is required').not().isEmpty(),
    ],
    (req: Request, res: Response) => {
      updateGeneral(req)
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
  settingsRouter.patch(
    '/smtp',
    ensureAuthorized,
    isUserValid,
    [
      body('mode', 'Mode is required').not().isEmpty(),
      body('client', 'Mode is required').not().isEmpty(),
      body('secret', 'Mode is required').not().isEmpty(),
    ],
    (req: Request, res: Response) => {
      updateSMTP(req)
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
  console.error('error in config setting router', e);
}
export default settingsRouter;
