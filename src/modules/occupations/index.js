import express from 'express';
import middleware from '../../middlewares';
import OccupationsController from './OccupationsController';

const occupationsRouter = express.Router();
const { authenticate } = middleware;

occupationsRouter.post(
  '/occupations',
  authenticate,
  OccupationsController.createOccupations
);
occupationsRouter.get(
  '/occupations',
  authenticate,
  OccupationsController.getAllOccupations
);

export default occupationsRouter;
