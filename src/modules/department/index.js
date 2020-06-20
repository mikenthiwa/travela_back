import express from 'express';
import middleware from '../../middlewares';
import DepartmentController from './DepartmentController';

const { authenticate, DepartmentValidation, RoleValidator } = middleware;
const DepartmentRouter = express.Router();

DepartmentRouter.get(
  '/departments',
  authenticate,
  RoleValidator.checkUserRole([
    'Super Administrator',
    'Travel Administrator',
    'Travel Team Member'
  ]),
  DepartmentController.getDepartment,
);

DepartmentRouter.get(
  '/all-departments',
  authenticate,
  RoleValidator.checkUserRole([
    'Super Administrator',
    'Travel Administrator',
    'Travel Team Member'
  ]),
  DepartmentValidation.validateParams,
  DepartmentController.getAllDepartments,
);

DepartmentRouter.get(
  '/department/:id',
  authenticate,
  DepartmentValidation.validateDepartmentId,
  DepartmentValidation.validateDepartmentsExistence,
  DepartmentController.getSingleDepartment,
);

DepartmentRouter.post(
  '/department',
  authenticate,
  RoleValidator.checkUserRole([
    'Super Administrator',
    'Travel Administrator',
    'Travel Team Member'
  ]),
  DepartmentValidation.validateDepartmentName,
  DepartmentValidation.validateIfDepartmentExists,
  DepartmentValidation.validateParentDepartmentName,
  DepartmentController.createDepartmentByAdmin,
);

DepartmentRouter.put(
  '/department/:id',
  authenticate,
  RoleValidator.checkUserRole([
    'Super Administrator',
    'Travel Administrator',
    'Travel Team Member'
  ]),
  DepartmentValidation.validateDepartmentId,
  DepartmentValidation.validateDepartmentName,
  DepartmentValidation.validateDepartmentsExistence,
  DepartmentValidation.validateParentDepartmentName,
  DepartmentController.editDepartmentByAdmin,
);

DepartmentRouter.delete(
  '/department/:id',
  authenticate,
  RoleValidator.checkUserRole([
    'Super Administrator',
    'Travel Administrator',
    'Travel Team Member'
  ]),
  DepartmentValidation.validateDepartmentId,
  DepartmentValidation.validateDepartmentsExistence,
  DepartmentController.deleteDepartment,
);

export default DepartmentRouter;
