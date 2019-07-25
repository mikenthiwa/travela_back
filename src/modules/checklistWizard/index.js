import express from 'express';
import middlewares from '../../middlewares';
import ChecklistWizardController from './ChecklistWizardController';

const { authenticate, RoleValidator, DynamicChecklistValidator } = middlewares;
const Router = express.Router();

Router.post(
  '/dynamic/checklist',
  authenticate,
  RoleValidator.checkUserRole([
    'Super Administrator',
    'Travel Administrator',
    'Travel Team Member'
  ]),
  DynamicChecklistValidator.validateChecklistRequest,
  DynamicChecklistValidator.validateChecklistOriginDestination,
  ChecklistWizardController.createChecklist
);

Router.get(
  '/dynamic/checklist',
  authenticate,
  RoleValidator.checkUserRole([
    'Super Administrator',
    'Travel Administrator',
    'Travel Team Member'
  ]),
  ChecklistWizardController.getAllChecklists
);

export default Router;
