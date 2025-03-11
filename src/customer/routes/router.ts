import { Router } from 'express';
import './auth';
// import leadRouter from './lead';
import { leadRouter, leadSignupRouter } from './lead';
import newsletterRouter from './newsletter';

const siteRouter: Router = Router();
try {
  siteRouter.use('/lead', leadRouter);
  siteRouter.use('/', leadSignupRouter);
  siteRouter.use('/newsletter', newsletterRouter);
} catch (err) {
  console.error('Error in Site Router', err);
}

export default siteRouter;
