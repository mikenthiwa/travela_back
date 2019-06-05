import express from 'express';
import middlewares from '../../middlewares';
import TripModificationController from './TripModificationController';

const {
  authenticate,
  RoleValidator,
  RequestValidator,
  Validator,
  TripModificationValidator
} = middlewares;

const Router = express.Router();

Router.post('/requests/:requestId/modifications',
  authenticate,
  TripModificationValidator.checkExistingRequest,
  TripModificationValidator.validateModification,
  TripModificationValidator.validateRequest,
  TripModificationValidator.validateDuplicateModification,
  TripModificationController.createModification);


Router.get('/requests/:requestId/modifications',
  authenticate,
  TripModificationValidator.checkExistingRequest,
  TripModificationController.getModificationsForRequest);

Router.get('/tripModifications',
  authenticate,
  RoleValidator.checkUserRole([
    'Super Administrator',
    'Travel Administrator',
    'Travel Team Member'
  ]),
  RequestValidator.getTravelaUser,
  Validator.validateRequest,
  TripModificationController.getModifications);

Router.put('/requests/modifications/:id',
  authenticate,
  RoleValidator.checkUserRole([
    'Super Administrator',
    'Travel Administrator',
    'Travel Team Member'
  ]),
  TripModificationValidator.checkExistingModification,
  TripModificationValidator.validateApproval,
  TripModificationController.updateModificationStatus);

export default Router;
