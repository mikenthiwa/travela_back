import express from 'express';
import middlewares from '../../middlewares';
import UserRoleController from './UserRoleController';
import UpdateUserRoleController from './UpdateRoleController';

const {
  authenticate, Validator, RoleValidator, DepartmentValidation
} = middlewares;
const Router = express.Router();

Router.get(
  '/user',
  authenticate,
  RoleValidator.checkUserRole([
    'Super Administrator',
    'Travel Administrator',
    'Travel Team Member'
  ]),
  UserRoleController.getAllUser
);

Router.get('/user/roles', authenticate, UserRoleController.getRoles);
Router.put('/user/admin', authenticate, UserRoleController.autoAdmin);
Router.get('/user/:id', authenticate, Validator.getUserId, UserRoleController.getOneUser);

Router.put(
  '/user/:id/profile',
  authenticate,
  RoleValidator.validatePersonalInformation,
  Validator.checkGender,
  Validator.checkSignedInUser,
  UserRoleController.updateUserProfile
);

Router.post(
  '/user',
  Validator.verifyLoginEmail,
  Validator.verifyToken,
  UserRoleController.addUser
);

Router.post(
  '/user/role',
  authenticate,
  RoleValidator.validateAddRole,
  RoleValidator.checkUserRole(['Super Administrator']),
  UserRoleController.addRole
);

Router.patch(
  '/user/role/:id',
  authenticate,
  RoleValidator.validateAddRole,
  RoleValidator.checkUserRole(['Super Administrator']),
  UpdateUserRoleController.updateRole
);

Router.put(
  '/user/role/update',
  authenticate,
  RoleValidator.checkUserRole([
    'Super Administrator',
    'Travel Administrator',
    'Travel Team Member'
  ]),
  RoleValidator.validateUpdateRole(),
  Validator.checkEmail,
  RoleValidator.roleExists,
  Validator.centerExists,
  RoleValidator.validateRoleAssignment,
  DepartmentValidation.validateRoleDepartment,
  UserRoleController.updateUserRole
);

Router.get('/user/roles/:id', authenticate, UserRoleController.getOneRole);

Router.delete(
  '/user/roles/:userId/:roleId',
  authenticate,
  RoleValidator.checkUserRole([
    'Super Administrator',
    'Travel Administrator',
    'Travel Team Member'
  ]),
  RoleValidator.roleExists,
  UserRoleController.deleteUserRole
);

Router.patch(
  '/user/roles/budgetChecker',
  authenticate,
  RoleValidator.checkUserRole(['Super Administrator']),
  RoleValidator.validateUpdateRole(false),
  Validator.checkEmail,
  DepartmentValidation.validateRoleDepartment,
  UserRoleController.updateBudgetCheckerRole
);

Router.post(
  '/pushNotification',
  RoleValidator.validateSubscription,
  RoleValidator.checkSubscription,
  UserRoleController.addSubscription
);

export default Router;
