import express from 'express';
import middleware from '../../middlewares';
import {
  getRequestsValidators,
  editAndCreateRequestValidators,
} from '../../helpers/validators';
import RequestsController from './RequestsController';

const RequestsRouter = express.Router();

const {
  authenticate, Validator, RoleValidator, RequestValidator
} = middleware;

RequestsRouter.get(
  '/requests',
  authenticate,
  getRequestsValidators,
  Validator.validateRequest,
  RequestsController.getUserRequests,
);

RequestsRouter.get(
  '/requests/:requestId',
  authenticate,
  RequestsController.getUserRequestDetails,
);

RequestsRouter.get(
  '/requests/:dept/users',
  authenticate,
  RequestsController.getTravellingTeammates,
);

RequestsRouter.post(
  '/requests',
  authenticate,
  editAndCreateRequestValidators,
  Validator.validateRequest, // check req.body
  RequestValidator.validateTripBeds,
  RequestsController.createRequest,
);

RequestsRouter.put(
  '/requests/:requestId',
  authenticate,
  editAndCreateRequestValidators,
  Validator.validateRequest,
  RequestValidator.validateTripBeds,
  RequestsController.updateRequest,
);

RequestsRouter.delete(
  '/requests/:requestId',
  authenticate,
  Validator.validateRequest,
  RequestsController.deleteRequest,
);

RequestsRouter.put(
  '/requests/:requestId/verify',
  authenticate,
  RequestValidator.validateRequestHasTrips,
  RequestValidator.checkStatusIsApproved,
  RoleValidator.checkUserRole(
    ['Super Administrator', 'Travel Administrator', 'Travel Team Member']
  ),
  Validator.validateTeamMemberLocation,
  RequestValidator.validateDepartureDate,
  RequestValidator.validateCheckListComplete,
  RequestsController.verifyRequest
);

export default RequestsRouter;
