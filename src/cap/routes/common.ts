import { body } from 'express-validator';
import { statusUpdate } from '../controller/common';
import { Request, Response, Router } from 'express';
import { CollectionName } from '../../types/mongoType';
import { ReplySuccess } from '../../types/responseType';
import { statusCode } from '../../types/internalType';
import { checkStatusandFor } from '../../helper/middlewares';
import { handleCatchError } from '../../helper/errorHandler';
import { capEnsureAuthorized, capIsUserValid } from '../helper/authHandler';

const commonRouter: Router = Router();
const allowdCollection: CollectionName[] = [CollectionName.COMPANYHOLIDAY];

try {
  commonRouter.patch(
    '/:status/:for?',
    capEnsureAuthorized,
    capIsUserValid,
    checkStatusandFor,
    [
      body('ids', 'id is required').isArray({ min: 1 }),
      body('collection', 'Collection is required').isIn(allowdCollection),
    ],
    (req: Request, res: Response) => {
      statusUpdate(req)
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
  console.error('error in config common router', e);
}

export default commonRouter;
