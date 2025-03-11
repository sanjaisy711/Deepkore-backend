import { Router } from 'express';
import './auth';
import dzitraUserRouter from './dzitrauser';
import dzitraRoleRouter from './dzitrarole';
import dzitraUserRoleRouter from './dzitrauserrole';
import userRouter from './user';
import roleRouter from './role';
import userRoleRouter from './userrole';
import newsletterRouter from './newsletter';
import leadRouter from './lead';
import leadStatusRouter from './leadstatus';
import leadTypeRouter from './leadtype';
import usertypeRouter from './usertype';
import industrytypeRouter from './industrytype';
import regionRouter from './region';
import planRouter from './plan';
import planTypeRouter from './plantype';
import subscriptionRouter from './subscription';
import customerRouter from './customer';
import settingsRouter from './settings';
import emailtemplateRouter from './emailtemplate';
import commonRouter from './common';
import { ObjectId } from 'mongodb';

const routes: Router = Router();
try {
  routes.use((req, res, next) => {
    if (req.headers.userid) {
      const loginUserId: string = req.headers.userid as string;
      req.context = { loginUserId: new ObjectId(loginUserId) };
    }
    next();
  });
  routes.use('/dzitrauser', dzitraUserRouter);
  routes.use('/dzitrarole', dzitraRoleRouter);
  routes.use('/dzitrauserrole', dzitraUserRoleRouter);
  routes.use('/user', userRouter);
  routes.use('/role', roleRouter);
  routes.use('/userrole', userRoleRouter);
  routes.use('/newsletter', newsletterRouter);
  routes.use('/lead', leadRouter);
  routes.use('/leadstatus', leadStatusRouter);
  routes.use('/leadtype', leadTypeRouter);
  routes.use('/usertype', usertypeRouter);
  routes.use('/industrytype', industrytypeRouter);
  routes.use('/region', regionRouter);
  routes.use('/plan', planRouter);
  routes.use('/plantype', planTypeRouter);
  routes.use('/subscription', subscriptionRouter);
  routes.use('/customer', customerRouter);
  routes.use('/settings', settingsRouter);
  routes.use('/emailtemplate', emailtemplateRouter);
  routes.use('/common', commonRouter);
} catch (err) {
  console.error('Error in Admin Router', err);
}

export default routes;
