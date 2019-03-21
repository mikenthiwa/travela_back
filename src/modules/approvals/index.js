import express from 'express';
import middleware from '../../middlewares';
import { getRequestsValidators } from '../../helpers/validators';
import ApprovalsController from './ApprovalsController';
import BudgetApprovalsController from './BudgetApprovalsController';

const ApprovalsRouter = express.Router();

const {
  authenticate, Validator, validateDirectReport, RoleValidator
} = middleware;

ApprovalsRouter.get(
  '/approvals',
  authenticate,
  RoleValidator.checkUserRole(
    ['Super Administrator', 'Travel Administrator', 'Manager',
      'Travel Team Member', 'Budget Checker']
  ),
  getRequestsValidators,
  Validator.validateRequest,
  ApprovalsController.getUserApprovals,
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
  authenticate,
  Validator.validateStatus,
  validateDirectReport,
  ApprovalsController.updateRequestStatus,
);

ApprovalsRouter.put(
  '/approvals/budgetStatus/:requestId',
  authenticate,
  RoleValidator.checkUserRole(
    ['Budget Checker']
  ),
  Validator.validateBudgetStatus,
  BudgetApprovalsController.updateBudgetApprovals,
);
export default ApprovalsRouter;
