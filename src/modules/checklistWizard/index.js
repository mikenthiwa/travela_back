import express from 'express';
import middlewares from '../../middlewares';
import ChecklistWizardController from './ChecklistWizardController';

const {
  authenticate,
  RoleValidator,
  DynamicChecklistValidator,
  RequestValidator
} = middlewares;
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

Router.get(
  '/dynamic/checklist/requests/:requestId',
  authenticate,
  RequestValidator.validateRequestHasTrips,
  ChecklistWizardController.getChecklistByRequest
);

Router.get(
  '/dynamic/checklist/deleted',
  authenticate,
  RoleValidator.checkUserRole([
    'Super Administrator',
    'Travel Administrator',
    'Travel Team Member'
  ]),
  ChecklistWizardController.getDeletedChecklists
);

Router.patch(
  '/dynamic/checklist/restore',
  authenticate,
  RoleValidator.checkUserRole([
    'Super Administrator',
    'Travel Administrator',
    'Travel Team Member'
  ]),
  ChecklistWizardController.restoreAllDeletedChecklist
);

Router.get(
  '/dynamic/checklist/:checklistId',
  authenticate,
  RoleValidator.checkUserRole([
    'Super Administrator',
    'Travel Administrator',
    'Travel Team Member'
  ]),
  ChecklistWizardController.getSingleChecklist
);

Router.patch(
  '/dynamic/checklist/:checklistId',
  authenticate,
  RoleValidator.checkUserRole([
    'Super Administrator',
    'Travel Administrator',
    'Travel Team Member'
  ]),
  DynamicChecklistValidator.validateChecklistRequest,
  ChecklistWizardController.updateChecklist
);

Router.delete(
  '/dynamic/checklist/:checklistId',
  authenticate,
  RoleValidator.checkUserRole([
    'Super Administrator',
    'Travel Administrator',
    'Travel Team Member'
  ]),
  ChecklistWizardController.deleteChecklist
);

Router.patch(
  '/dynamic/checklist/restore/:checklistId',
  authenticate,
  RoleValidator.checkUserRole([
    'Super Administrator',
    'Travel Administrator',
    'Travel Team Member'
  ]),
  ChecklistWizardController.restoreDeletedChecklist
);

export default Router;
