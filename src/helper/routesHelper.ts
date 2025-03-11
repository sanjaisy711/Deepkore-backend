import { Router } from 'express';
import adminRoutes from '../admin/routes';
import customerRoutes from '../customer/routes';
import capRoutes from '../cap/routes';

const allRouter: Router = Router();
try {
  allRouter.use(adminRoutes);
  allRouter.use(customerRoutes);
  allRouter.use(capRoutes);
} catch (err) {
  console.error('Error in Router', err);
}

export default allRouter;
