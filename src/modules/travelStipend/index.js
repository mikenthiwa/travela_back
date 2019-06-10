import express from 'express';
import middleware from '../../middlewares';
import TravelStipendController from './TravelStipendController';

const {
  authenticate,
  RoleValidator,
  TravelStipendValidator
} = middleware;
const TravelStipendRouter = express.Router();

TravelStipendRouter.post(
  '/travelStipend',
  authenticate,
  TravelStipendValidator.validateNewStipend,
  TravelStipendValidator.checkCenter,
  RoleValidator.checkUserRole(
    ['Super Administrator', 'Travel Administrator', 'Travel Team Member']
  ),
  TravelStipendController.createTravelStipend,
);

TravelStipendRouter.get('/travelStipend',
  authenticate,
  TravelStipendController.getAllTravelStipends);

TravelStipendRouter.delete(
  '/travelStipend/:id',
  authenticate,
  RoleValidator.checkUserRole(
    ['Super Administrator', 'Travel Administrator', 'Travel Team Member']
  ),
  TravelStipendController.deleteTravelStipend,
);

TravelStipendRouter.get(
  '/travelStipend/:id',
  authenticate,
  RoleValidator.checkUserRole(
    ['Super Administrator', 'Travel Administrator', 'Travel Team Member']
  ),
  TravelStipendValidator.validateUpdateParams,
  TravelStipendController.getOneTravelStipend
);

TravelStipendRouter.put(
  '/travelStipend/:id',
  authenticate,
  RoleValidator.checkUserRole(
    ['Super Administrator', 'Travel Administrator', 'Travel Team Member']
  ),
  TravelStipendValidator.validateUpdateParams,
  TravelStipendValidator.validateNewStipend,
  TravelStipendValidator.checkCenter,
  TravelStipendController.updateTravelStipend
);

export default TravelStipendRouter;
