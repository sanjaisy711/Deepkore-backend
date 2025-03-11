import { Request, Response, Router } from 'express';
import { body, param } from 'express-validator';
import { handleCatchError } from '../../helper/errorHandler';
import { statusCode } from '../../types/internalType';
import { ReplySuccess } from '../../types/responseType';
import {
  getFormatSetting,
  getHoliday,
  getSetting,
  getWorkSetting,
  updateFormatSetting,
  updateHoliday,
  updateSetting,
  updateWorkSetting,
  cloneHoliday,
} from '../controller/capsettings';
import { capEnsureAuthorized, capIsUserValid } from '../helper/authHandler';

const capSettingsRouter: Router = Router();

try {
  capSettingsRouter.get(
    '/setting',
    capEnsureAuthorized,
    capIsUserValid,
    (req: Request, res: Response) => {
      getSetting(req)
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
  capSettingsRouter.patch(
    '/setting',
    capEnsureAuthorized,
    capIsUserValid,
    [
      body('accountname', 'Account name is required').not().isEmpty(),
      body('accountdomain', 'Domain is required').not().isEmpty(),
      body('accountowner', 'Owner is required').not().isEmpty(),
      body('accountlogo', 'Logo is required').not().isEmpty(),
      body('mobileappname', 'App Name is required').not().isEmpty(),
      body('mobileapplogo', 'App Logo is required').not().isEmpty(),
      body('accounttheme', 'Theme is required').not().isEmpty(),
      body('startingtime', 'Start time is required').not().isEmpty(),
      body('closingtime', 'Close time is required').not().isEmpty(),
      body('holidayflagremainder', 'Reminder is required')
        .not()
        .isEmpty()
        .isNumeric(),
    ],
    (req: Request, res: Response) => {
      updateSetting(req)
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
  capSettingsRouter.get(
    '/formatsetting',
    capEnsureAuthorized,
    capIsUserValid,
    (req: Request, res: Response) => {
      getFormatSetting(req)
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
  capSettingsRouter.patch(
    '/formatsetting',
    capEnsureAuthorized,
    capIsUserValid,
    [
      body('accounttimezone', 'Time Zone is required').not().isEmpty(),
      body('language', 'Language is required').not().isEmpty(),
      body('dateformat', 'Date format is required').not().isEmpty(),
      body('numberformat', 'Number format is required').not().isEmpty(),
      body('currencyformat', 'Currency format is required').not().isEmpty(),
    ],
    (req: Request, res: Response) => {
      updateFormatSetting(req)
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
  capSettingsRouter.get(
    '/worksetting/:year',
    capEnsureAuthorized,
    capIsUserValid,
    [param('year', 'Year is required').not().isEmpty().isNumeric()],
    (req: Request, res: Response) => {
      getWorkSetting(req)
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
  capSettingsRouter.patch(
    '/worksetting',
    capEnsureAuthorized,
    capIsUserValid,
    [
      body('year', 'Year is required').not().isEmpty().isNumeric(),
      body('day', 'Day is required')
        .not()
        .isEmpty()
        .isIn([0, 1, 2, 3, 4, 5, 6, '0', '1', '2', '3', '4', '5', '6']),
      body('workstatus', 'Status is required').not().isEmpty().toBoolean(),
    ],
    (req: Request, res: Response) => {
      updateWorkSetting(req)
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
  capSettingsRouter.get(
    '/holidaysetting/:year',
    capEnsureAuthorized,
    capIsUserValid,
    [param('year', 'Year is required').not().isEmpty().isNumeric()],
    (req: Request, res: Response) => {
      getHoliday(req)
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
  capSettingsRouter.patch(
    '/holidaysetting',
    capEnsureAuthorized,
    capIsUserValid,
    [
      body('holidaydate', 'Date is required').not().isEmpty(),
      body('description', 'Description is required').not().isEmpty(),
    ],
    (req: Request, res: Response) => {
      updateHoliday(req)
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
  capSettingsRouter.post(
    '/cloneholiday',
    capEnsureAuthorized,
    capIsUserValid,
    [
      body('fromYear', 'From year is required').not().isEmpty().isNumeric(),
      body('toYear', 'To year is required').not().isEmpty().isNumeric(),
    ],
    (req: Request, res: Response) => {
      cloneHoliday(req)
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
  console.error('error in cap setting router', e);
}
export default capSettingsRouter;
