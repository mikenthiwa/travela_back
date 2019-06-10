import express from 'express';
import TravelCostsController from './TravelCostsController';
import middlewares from '../../middlewares';

const { authenticate, TravelStipendValidator } = middlewares;
const Router = express.Router();

Router.get(
  '/travelCosts',
  authenticate,
  TravelStipendValidator.validateTravelStipendsLocations,
  TravelCostsController.getTravelCosts
);

export default Router;
