import express from 'express';
import middleware from '../../middlewares';
import DepartmentController from './DepartmentController';

const { authenticate, DepartmentValidation, RoleValidator } = middleware;
const Router = express.Router();

Router.get(
  '/departments',
  authenticate,
  RoleValidator.checkUserRole([
    'Super Administrator',
    'Travel Administrator',
    'Travel Team Member'
  ]),
  DepartmentController.getDepartment,
);

Router.post(
  '/department',
  authenticate,
  RoleValidator.checkUserRole([
    'Super Administrator',
    'Travel Administrator',
    'Travel Team Member'
  ]),
  DepartmentValidation.validateDepartment,
  DepartmentController.createDepartmentFromApi,
);

export default Router;
