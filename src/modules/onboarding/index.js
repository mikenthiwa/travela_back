import express from 'express';
import NoPassportController from './NoPassportController';
import middleware from '../../middlewares';

const { authenticate } = middleware;

const NoPassportRouter = express.Router();

NoPassportRouter.post(
  '/no-passport',
  authenticate,
  NoPassportController.sendNotificationToTravelAdmin
);

export default NoPassportRouter;
