import express from 'express';
import middleware from '../../middlewares';
import TravelChecklistController from './TravelChecklistController';
import {
  validateChecklistItem,
  deleteChecklistItem
} from '../../helpers/validators';

const TravelChecklistRouter = express.Router();

const {
  authenticate, Validator, RoleValidator, ChecklistValidator
} = middleware;

TravelChecklistRouter.get(
  '/checklists',
  authenticate,
  RoleValidator.validateChecklistQuery,
  RoleValidator.validateRequestIdQuery,
  RoleValidator.validateDestinationNameQuery,
  TravelChecklistController.getChecklistsResponse
);

TravelChecklistRouter.delete(
  '/checklists/:checklistId',
  authenticate,
  RoleValidator.checkUserRole([
    'Super Administrator',
    'Travel Administrator',
    'Travel Team Member'
  ]),
  deleteChecklistItem,
  Validator.validateRequest,
  TravelChecklistController.deleteChecklistItem
);

TravelChecklistRouter.post(
  '/checklists',
  authenticate,
  RoleValidator.checkUserRole([
    'Super Administrator',
    'Travel Administrator',
    'Travel Team Member'
  ]),
  validateChecklistItem,
  Validator.validateRequest,
  TravelChecklistController.createChecklistItem
);

TravelChecklistRouter.get(
  '/checklists/deleted',
  authenticate,
  TravelChecklistController.getDeletedChecklistItems
);

TravelChecklistRouter.put(
  '/checklists/:checklistId',
  authenticate,
  RoleValidator.checkUserRole([
    'Super Administrator',
    'Travel Administrator',
    'Travel Team Member'
  ]),
  validateChecklistItem,
  Validator.validateRequest,
  TravelChecklistController.updateChecklistItem
);

TravelChecklistRouter.post(
  '/checklists/:requestId/submissions/:checklistItemId',
  authenticate,
  ChecklistValidator.validateSubmission,
  ChecklistValidator.validateTrip,
  ChecklistValidator.validateUniqueItem,
  TravelChecklistController.addChecklistItemSubmission
);

TravelChecklistRouter.get(
  '/checklists/:requestId/submissions',
  authenticate,
  TravelChecklistController.getCheckListItemSubmission,
);

export default TravelChecklistRouter;
