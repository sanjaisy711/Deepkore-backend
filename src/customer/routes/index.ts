import { Router } from 'express';
import siteRouter from './router';

const routes: Router = Router();
try {
  routes.use('/site', siteRouter);
} catch (err) {
  console.error('Error in Site Router', err);
}

export default routes;
