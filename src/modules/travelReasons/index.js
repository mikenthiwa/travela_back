import express from 'express';
import middleware from '../../middlewares';
import TravelReasonsController from './TravelReasonsController';

const { authenticate, RoleValidator, TravelReasonsValidator } = middleware;

const TravelReasonsRouter = express.Router();

const authMiddleware = [
  authenticate,
  RoleValidator.checkUserRole(
    ['Super Administrator', 'Travel Administrator', 'Travel Team Member']
  )
];

TravelReasonsRouter.post(
  '/request/reasons',
  ...authMiddleware,
  TravelReasonsValidator.verifyId,
  TravelReasonsValidator.verifyTravelReasonBody,
  TravelReasonsValidator.verifyTitle,
  TravelReasonsController.createTravelReason,
);

TravelReasonsRouter.get(
  '/request/reasons',
  authenticate,
  RoleValidator.checkUserRole(
    ['Super Administrator', 'Travel Administrator', 'Manager', 'Travel Team Member', 'Requester']
  ),
  TravelReasonsValidator.validateParams,
  TravelReasonsController.getTravelReasons,
);

TravelReasonsRouter.delete(
  '/request/reasons/:id',
  ...authMiddleware,
  TravelReasonsValidator.validateTravelReasonId,
  TravelReasonsValidator.checkTravelReason,
  TravelReasonsController.deleteReason,
);

TravelReasonsRouter.get(
  '/request/reasons/:id',
  ...authMiddleware,
  TravelReasonsValidator.validateTravelReasonId,
  TravelReasonsValidator.checkTravelReason,
  TravelReasonsController.getTravelReason,
);

TravelReasonsRouter.put(
  '/request/reasons/:id',
  ...authMiddleware,
  TravelReasonsValidator.validateTravelReasonId,
  TravelReasonsValidator.verifyTravelReasonBody,
  TravelReasonsValidator.checkTravelReason,
  TravelReasonsValidator.verifyTitle,
  TravelReasonsController.updateTravelReason
);

export default TravelReasonsRouter;
