import { Router } from 'express';
import capRouter from './router';

const routes: Router = Router();
try {
  routes.use('/cap', capRouter);
} catch (err) {
  console.error('Error in CAP Router', err);
}

export default routes;
