import express from 'express';
import BambooUserController from './BambooUserController';
import middlewares from '../../middlewares';

const { BambooWebhookValidator } = middlewares;
const Router = express.Router();

Router.post(
  '/bamboohr/user/:key',
  BambooWebhookValidator.dataValidator,
  BambooWebhookValidator.validateSecretKey,
  BambooWebhookValidator.validateBambooUsers,
  BambooWebhookValidator.validateRequest,
  BambooUserController.createOrUpdateUser
);

export default Router;
