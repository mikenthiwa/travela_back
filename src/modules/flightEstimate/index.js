import { Router } from 'express';
import middlewares from '../../middlewares/index';
import FlightEstimateController from './FlightEstimateController';
import flightEstimateValidator from '../../middlewares/FlightEstimateValidator';

const {
  authenticate,
  RoleValidator: { checkUserRole }
} = middlewares;

const allowedRoles = [
  'Super Administrator',
  'Travel Administrator',
  'Travel Team Member'
];

const {
  validateId,
  validateFlightEstimate,
  validateEstimateUpadate,
  validateQueryString,
  checkOriginDestination,
} = flightEstimateValidator;

const {
  createFlightEstimate,
  getAllFlightEstimates,
  deleteFlightEstimate,
  getOneFlightEstimate,
  updateFlightEstimate,
} = FlightEstimateController;

const FlightRouter = Router();

FlightRouter.post(
  '/flightEstimate',
  authenticate,
  checkUserRole(allowedRoles),
  validateFlightEstimate,
  checkOriginDestination,
  createFlightEstimate
);

FlightRouter.get(
  //  get paginated estimate endpoint with /flightEstimate/?page=1&limit=2
  '/flightEstimate',
  authenticate,
  validateQueryString,
  getAllFlightEstimates
);

FlightRouter.get('/flightEstimate/:id',
  authenticate,
  checkUserRole(allowedRoles),
  validateId,
  getOneFlightEstimate);

FlightRouter.delete('/flightEstimate/:id',
  authenticate,
  checkUserRole(allowedRoles),
  validateId,
  deleteFlightEstimate);

FlightRouter.put('/flightEstimate/:id',
  authenticate,
  checkUserRole(allowedRoles),
  validateEstimateUpadate,
  updateFlightEstimate);

export default FlightRouter;
