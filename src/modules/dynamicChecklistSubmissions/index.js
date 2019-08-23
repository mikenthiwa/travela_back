import express from 'express';
import middlewares from '../../middlewares';
import DynamicChecklistSubmissionsController from './dynamicChecklistSubmissionsController';

const {
  authenticate,
} = middlewares;
const Router = express.Router();

Router.post(
  '/dynamic-checklists/:requestId/submissions',
  authenticate,
  DynamicChecklistSubmissionsController.postChecklistSubmission
);

Router.get(
  '/dynamic-checklists/:requestId/submissions',
  authenticate,
  DynamicChecklistSubmissionsController.fetchChecklistSubmission
);

export default Router;
