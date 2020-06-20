import express from 'express';
import middleware from '../../middlewares';
import RemindersController from './remindersController';

const { authenticate, RoleValidator, ReminderValidator } = middleware;

const RemindersRouter = express.Router();

RemindersRouter.post(
  '/reminders',
  authenticate,
  RoleValidator.checkUserRole(
    ['Super Administrator', 'Travel Administrator', 'Travel Team Member']
  ),
  ReminderValidator.validateReminder,
  ReminderValidator.validateReminderTemplates,
  ReminderValidator.validateUniqueReminderCondition,
  ReminderValidator.checkUniqueFrequency,
  RemindersController.createReminder,
);

RemindersRouter.get(
  '/reminders',
  authenticate,
  RoleValidator.checkUserRole([
    'Super Administrator',
    'Travel Administrator',
    'Travel Team Member'
  ]),
  RemindersController.viewReminders
);


RemindersRouter.put(
  '/reminders/:conditionId',
  authenticate,
  RoleValidator.checkUserRole(
    ['Super Administrator', 'Travel Administrator', 'Travel Team Member']
  ),
  ReminderValidator.validateReminder,
  ReminderValidator.validateReminderTemplates,
  ReminderValidator.checkReminderWithId,
  ReminderValidator.validateUniqueReminderCondition,
  ReminderValidator.checkUniqueFrequency,
  RemindersController.updateReminder,
);

RemindersRouter.put(
  '/reminders/conditions/disable/:conditionId',
  authenticate,
  RoleValidator.checkUserRole(
    ['Super Administrator', 'Travel Administrator', 'Travel Team Member']
  ),
  ReminderValidator.checkIfConditionExists,
  ReminderValidator.validateReason,
  RemindersController.disableReminderConditions,
);

RemindersRouter.get(
  '/reminders/:conditionId',
  authenticate,
  RoleValidator.checkUserRole(
    ['Super Administrator', 'Travel Administrator', 'Travel Team Member']
  ),
  ReminderValidator.getConditionById,
  RemindersController.getSingleReminder,
);

RemindersRouter.put(
  '/reminders/conditions/enable/:conditionId',
  authenticate,
  RoleValidator.checkUserRole(
    ['Super Administrator', 'Travel Administrator', 'Travel Team Member']
  ),
  ReminderValidator.checkIfDisabledConditionExists,
  RemindersController.enableReminderConditions
);

export default RemindersRouter;
