import express from 'express';
import middleware from '../../middlewares';
import NotificationController from './NotificationsController';

const NotificationsRouter = express.Router();

const { authenticate, Validator } = middleware;

NotificationsRouter.get(
  '/notifications',
  authenticate,
  Validator.validateRequest,
  NotificationController.retrieveNotifications
);

NotificationsRouter.put(
  '/notifications',
  authenticate,
  Validator.validateNotificationStatus,
  NotificationController.updateNotificationStatus
);

NotificationsRouter.put(
  '/notifications/:id',
  authenticate,
  NotificationController.markNotificationAsRead
);

NotificationsRouter.post(
  '/email',
  NotificationController.receivedComment
);

export default NotificationsRouter;
