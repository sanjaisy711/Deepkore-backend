import { Router } from 'express';
import authRouter from './auth';
import capSettingsRouter from './capsettings';
import commonRouter from './common';
import capRoleRouter from './role';

const capRouter: Router = Router();
try {
  capRouter.use(authRouter);
  capRouter.use('/settings', capSettingsRouter);
  capRouter.use('/common', commonRouter);
  capRouter.use('/role', capRoleRouter);
} catch (err) {
  console.error('Error in CAP Router', err);
}

export default capRouter;
