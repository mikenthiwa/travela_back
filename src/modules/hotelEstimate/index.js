import express from 'express';
import middleware from '../../middlewares';
import HotelEstimateController from './HotelEstimateController';

const {
  authenticate, RoleValidator, HotelEstimateValidator, TravelStipendValidator
} = middleware;
const HotelEstimateRouter = express.Router();

HotelEstimateRouter.post(
  '/hotelEstimate',
  authenticate,
  HotelEstimateValidator.validateNewEstimate,
  HotelEstimateValidator.checkLocation,
  RoleValidator.checkUserRole([
    'Super Administrator',
    'Travel Administrator',
    'Travel Team Member'
  ]),
  HotelEstimateController.createHotelEstimate
);

HotelEstimateRouter.get(
  '/hotelEstimate',
  authenticate,
  HotelEstimateController.getAllHotelEstimates
);

HotelEstimateRouter.get(
  '/hotelEstimate/region/:id',
  authenticate,
  TravelStipendValidator.validateUpdateParams,
  HotelEstimateController.getEstimatesInRegion
);

HotelEstimateRouter.get(
  '/hotelEstimate/:id',
  authenticate,
  RoleValidator.checkUserRole([
    'Super Administrator',
    'Travel Administrator',
    'Travel Team Member'
  ]),
  TravelStipendValidator.validateUpdateParams,
  HotelEstimateValidator.checkHotelEstimate,
  HotelEstimateController.getOneHotelEstimate
);

HotelEstimateRouter.delete(
  '/hotelEstimate/:id',
  authenticate,
  RoleValidator.checkUserRole([
    'Super Administrator',
    'Travel Administrator',
    'Travel Team Member'
  ]),
  TravelStipendValidator.validateUpdateParams,
  HotelEstimateValidator.checkHotelEstimate,
  HotelEstimateController.deleteOneHotelEstimate
);

HotelEstimateRouter.put(
  '/hotelEstimate/:id',
  authenticate,
  HotelEstimateValidator.validateEditEstimate,
  RoleValidator.checkUserRole([
    'Super Administrator',
    'Travel Administrator',
    'Travel Team Member'
  ]),
  TravelStipendValidator.validateUpdateParams,
  HotelEstimateValidator.checkHotelEstimate,
  HotelEstimateController.updateHotelEstimate
);

export default HotelEstimateRouter;
