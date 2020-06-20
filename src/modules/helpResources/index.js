import express from 'express';
import middleware from '../../middlewares';
import HelpResourcesController from './HelpResourcesController';

const {
  authenticate,
  RoleValidator,
} = middleware;

const Router = express.Router();

Router.get(
  '/_help',
  authenticate,
  HelpResourcesController.getHelpResources
);

Router.post(
  '/_help',
  authenticate,
  RoleValidator.checkUserRole([
    'Super Administrator',
    'Travel Administrator',
  ]),
  HelpResourcesController.createHelpResources
);

export default Router;
