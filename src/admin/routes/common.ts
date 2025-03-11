import { body } from 'express-validator';
import { ensureAuthorized, isUserValid } from '../helper/authHandler';
import { statusUpdate } from '../controller/common';
import { Request, Response, Router } from 'express';
import { CollectionName } from '../../types/mongoType';
import { ReplySuccess } from '../../types/responseType';
import { statusCode } from '../../types/internalType';
import { handleCatchError } from '../../helper/errorHandler';
import { checkStatusandFor } from '../../helper/middlewares';

const commonRouter: Router = Router();
const allowdCollection: CollectionName[] = [
  CollectionName.Role,
  CollectionName.User,
  CollectionName.DzitraRole,
  CollectionName.DzitraUser,
  CollectionName.NewsLetter,
  CollectionName.Lead,
  CollectionName.LeadType,
  CollectionName.LeadStatus,
  CollectionName.Region,
  CollectionName.UserType,
  CollectionName.Plan,
  CollectionName.Region,
  CollectionName.EmailTemplate,
];

try {
  commonRouter.patch(
    '/:status/:for?',
    ensureAuthorized,
    isUserValid,
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
