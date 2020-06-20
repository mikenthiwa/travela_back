import express from 'express';
import middleware from '../../middlewares';
import TripsController from './TripsController';

const TripsRouter = express.Router();

const { authenticate, tripValidator } = middleware;

TripsRouter.put(
  '/trips/:tripId',
  authenticate,
  tripValidator.validateCheckType,
  tripValidator.checkTripExists,
  tripValidator.checkTripOwner,
  tripValidator.checkTripVerified,
  TripsController.updateCheckStatus,
);

TripsRouter.get(
  '/trips',
  authenticate,
  TripsController.getTrips,
);

TripsRouter.post(
  '/trips',
  authenticate,
  tripValidator.validateTripValidator,
  TripsController.validateTripRequest
);

TripsRouter.put(
  '/trips/:tripId/room',
  authenticate,
  tripValidator.checkTravelAdmin,
  tripValidator.validateBed,
  tripValidator.validateReason,
  tripValidator.checkBedExists,
  tripValidator.checkTripExists,
  tripValidator.checkTripCheckedOut,
  tripValidator.isBedAvailable,
  tripValidator.isRoomFaulty,
  tripValidator.isGenderAllowed,
  TripsController.updateTripRoom
);

export default TripsRouter;
