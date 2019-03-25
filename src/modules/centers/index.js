import express from 'express';
import CentersController from './CentersController';
import middlewares from '../../middlewares';

const { authenticate, RoleValidator, Validator } = middlewares;
const Router = express.Router();

Router.get('/centers', authenticate, CentersController.getCenters);

Router.get('/centers',
  authenticate,
  CentersController.getCenters);

Router.post('/centers',
  authenticate,
  Validator.validateNewCentre,
  RoleValidator.checkUserRole(['Super Administrator']),
  CentersController.createCenter);

export default Router;
