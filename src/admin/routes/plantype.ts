import { Request, Response, Router } from 'express';
import { handleCatchError } from '../../helper/errorHandler';
import { statusCode } from '../../types/internalType';
import { ReplySuccess } from '../../types/responseType';
import { getAllActivePlanType } from '../controller/plantype';
import { ensureAuthorized, isUserValid } from '../helper/authHandler';

const planTypeRouter: Router = Router();
try {
  planTypeRouter.get(
    '/all/active',
    ensureAuthorized,
    isUserValid,
    (req: Request, res: Response) => {
      getAllActivePlanType(req)
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
  console.error('error in config plantype router', e);
}

export default planTypeRouter;
