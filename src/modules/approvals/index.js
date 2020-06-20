import express from 'express';
import middleware from '../../middlewares';
import { getRequestsValidators } from '../../helpers/validators';
import ApprovalsController from './ApprovalsController';
import BudgetApprovalsController from './BudgetApprovalsController';
import TravelAdminApprovalController from './TravelAdminApprovalController';
import { authenticateEmailApproval } from '../../middlewares/authenticate';

const ApprovalsRouter = express.Router();

const {
  authenticate, Validator, validateDirectReport, RoleValidator, RequestValidator
} = middleware;

ApprovalsRouter.get(
  '/approvals',
  authenticate,
  RoleValidator.checkUserRole(
    ['Super Administrator', 'Travel Administrator', 'Manager',
      'Travel Team Member', 'Budget Checker']
  ),
  getRequestsValidators,
  RequestValidator.getTravelaUser,
  Validator.validateRequest,
  ApprovalsController.getUserApprovals,
);

ApprovalsRouter.get(
  '/approvals/travel-admin',
  authenticate,
  RoleValidator.checkUserRole(
    ['Super Administrator', 'Travel Administrator',
      'Travel Team Member']
  ),
  getRequestsValidators,
  RequestValidator.getTravelaUser,
  Validator.validateRequest,
  TravelAdminApprovalController.getTravelAdminRequest,
);


ApprovalsRouter.get(
  '/approvals/budget',
  authenticate,
  RoleValidator.checkUserRole(['Budget Checker']),
  getRequestsValidators,
  Validator.validateRequest,
  BudgetApprovalsController.getBudgetApprovals
);

ApprovalsRouter.put(
  '/approvals/:requestId',
  authenticateEmailApproval,
  authenticate,
  Validator.validateStatus,
  RequestValidator.getTravelaUser,
  validateDirectReport,
  ApprovalsController.updateRequestStatus,
);

ApprovalsRouter.put(
  '/approvals/budgetStatus/:requestId',
  authenticateEmailApproval,
  authenticate,
  RoleValidator.checkUserRole(
    ['Budget Checker']
  ),
  Validator.validateBudgetStatus,
  BudgetApprovalsController.updateBudgetApprovals,
);
export default ApprovalsRouter;
