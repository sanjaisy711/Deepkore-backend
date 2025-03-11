import { body, param } from 'express-validator';
import {
  ensureAuthorized,
  isSupportAuth,
  isUserValid,
} from '../helper/authHandler';
import { Request, Response, Router } from 'express';
import passport from 'passport';
import { AuthUser, ReplySuccess } from '../../types/responseType';
import { statusCode } from '../../types/internalType';
import { handleCatchError } from '../../helper/errorHandler';
import { checkListStatus } from '../../helper/middlewares';
import {
  getDzitraUser,
  getDzitraUserList,
  newDzitraUser,
  updateDzitraUser,
  getAllActiveDzitraUser,
  forgotPassword,
  checkResetLinkExpiry,
  adminResetPassword,
  adminResetForgotPassword,
} from '../controller/dzitrauser';

const dzitraUserRouter: Router = Router();
try {
  dzitraUserRouter.post(
    '/signin',
    [
      body('username', 'Username is required!').not().isEmpty(),
      body('password', 'Password is required!').not().isEmpty(),
    ],
    passport.authenticate('adminsignin', {
      // successRedirect: '/dzitrauser/signin-success',
      failureRedirect: '/dzitrauser/signin-failure',
      failureFlash: true,
    }),
    function (req: Request, res: Response): void {
      const user = req.user as AuthUser;
      res.cookie('username', user.header);
      res
        .status(statusCode.Success)
        .json({ username: user.username, id: user.id, token: user.header });
    }
  );

  dzitraUserRouter.get('/signout', (req: Request, res: Response): void => {
    req.session.destroy(function (err) {
      if (err) {
        res
          .status(statusCode.BadRequest)
          .json({ status: 0, message: 'failure' });
      } else {
        res.status(statusCode.Success).json({ status: 1, message: 'success' });
      }
    });
  });

  dzitraUserRouter.get(
    '/signin-success',
    isSupportAuth,
    (req: Request, res: Response): void => {
      const user = req.user as AuthUser;
      res.cookie('username', user.header);
      res
        .status(statusCode.Success)
        .json({ username: user.username, id: user.id, token: user.header });
    }
  );

  dzitraUserRouter.get(
    '/signin-failure',
    (req: Request, res: Response): void => {
      res.cookie('username', 'wrong');
      const message: string = req.flash('message')[0];
      req.session.destroy((_err) => {});
      res.status(statusCode.BadRequest).json({ status: 0, message });
    }
  );
  dzitraUserRouter.post(
    '/',
    ensureAuthorized,
    isUserValid,
    [
      body('name', 'Name is required').not().isEmpty(),
      body('email', 'Email is required').isEmail().not().isEmpty(),
      body('display_name', 'Display name is required').not().isEmpty(),
    ],
    (req: Request, res: Response) => {
      newDzitraUser(req)
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
  dzitraUserRouter.patch(
    '/',
    ensureAuthorized,
    isUserValid,
    [
      body('_id', 'Id is required').not().isEmpty().isMongoId(),
      body('name', 'Name is required').not().isEmpty(),
      body('email', 'Email is required').isEmail().not().isEmpty(),
      body('display_name', 'Display name is required').not().isEmpty(),
    ],
    (req: Request, res: Response) => {
      updateDzitraUser(req)
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
  dzitraUserRouter.get(
    '/:id',
    ensureAuthorized,
    isUserValid,
    [param('id', 'Id is required').not().isEmpty().isMongoId()],
    (req: Request, res: Response) => {
      getDzitraUser(req)
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
  dzitraUserRouter.get(
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
      getDzitraUserList(req)
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
  dzitraUserRouter.get(
    '/all/active',
    ensureAuthorized,
    isUserValid,
    (req: Request, res: Response) => {
      getAllActiveDzitraUser(req)
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
  dzitraUserRouter.post(
    '/forgot/password',
    [body('email', 'Email is required!').not().isEmpty().isEmail()],
    (req: Request, res: Response) => {
      forgotPassword(req)
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
  dzitraUserRouter.get(
    '/check/reset/link',
    ensureAuthorized,
    (req: Request, res: Response) => {
      checkResetLinkExpiry(req)
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
  dzitraUserRouter.post(
    '/submit/reset/forgot-password',
    ensureAuthorized,
    [body('password', 'Password is required').not().isEmpty()],
    (req: Request, res: Response) => {
      adminResetForgotPassword(req)
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
  dzitraUserRouter.post(
    '/submit/reset/password',
    ensureAuthorized,
    isUserValid,
    [
      body('password', 'Password is required').not().isEmpty(),
      body('newpassword', 'New password is required').not().isEmpty(),
    ],
    (req: Request, res: Response) => {
      adminResetPassword(req)
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
  console.error('error in config dzitra user router', e);
}
export default dzitraUserRouter;
