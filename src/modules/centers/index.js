import express from 'express';
import CentersController from './CentersController';
import middlewares from '../../middlewares';

const { authenticate, RoleValidator, Validator } = middlewares;
const Router = express.Router();

Router.get('/centers', authenticate, CentersController.getCenters);

Router.get('/centers', authenticate, CentersController.getCenters);

Router.post(
  '/centers',
  authenticate,
  Validator.validateNewCentre,
  RoleValidator.checkUserRole(['Super Administrator']),
  CentersController.createCenter
);

Router.patch(
  '/center/user',
  authenticate,
  RoleValidator.checkUserRole([
    'Super Administrator',
    'Travel Administrator'
  ]),
  RoleValidator.validateUpdateRole(),
  Validator.checkEmail,
  RoleValidator.roleExists,
  Validator.centerExists,
  RoleValidator.validateRoleAssignment,
  CentersController.changeCenter
);

export default Router;
