import express from 'express';
import TravelRegionController from './TravelRegionController';
import middlewares from '../../middlewares';

const TravelRegionsRouter = express.Router();
const {
  authenticate,
  RoleValidator,
  TravelRegionsValidator
} = middlewares;

TravelRegionsRouter.post(
  '/regions',
  authenticate,
  TravelRegionsValidator.inputValidation,
  TravelRegionsValidator.conditionValidation,
  RoleValidator.checkUserRole([
    'Super Administrator',
    'Travel Administrator',
    'Travel Team Member'
  ]),
  TravelRegionController.addRegion,
);
TravelRegionsRouter.get(
  '/regions',
  authenticate,
  RoleValidator.checkUserRole([
    'Super Administrator',
    'Travel Administrator',
    'Travel Team Member'
  ]),
  TravelRegionController.getRegion,
);
export default TravelRegionsRouter;
