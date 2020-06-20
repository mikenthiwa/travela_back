import express from 'express';
import HealthCheckController from './HealthCheckController';

const Router = express.Router();

Router.get('/_healthz', HealthCheckController.welcome);

export default Router;
