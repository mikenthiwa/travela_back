import express from 'express';
import middlewares from '../../middlewares';
import TripModificationController from './TripModificationController';

const {
  authenticate,
  TripModificationValidator
} = middlewares;

const Router = express.Router();

Router.post('/requests/:requestId/modifications',
  authenticate,
  TripModificationValidator.checkExistingRequest,
  TripModificationValidator.validateModification,
  TripModificationValidator.validateRequest,
  TripModificationController.createModification);


Router.get('/requests/:requestId/modifications',
  authenticate,
  TripModificationValidator.checkExistingRequest,
  TripModificationController.getModificationsForRequest);

export default Router;
