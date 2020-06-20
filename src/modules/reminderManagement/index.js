import express from 'express';
import { sanitizeQuery } from 'express-validator/filter';
import middleware from '../../middlewares';
import EmailTemplateController from './EmailTemplateController';

const ReminderManagementRouter = express.Router();
const {
  authenticate, RoleValidator, ReminderEmailTemplateValidator, ReminderValidator
} = middleware;

ReminderManagementRouter.post(
  '/reminderManagement/emailTemplates',
  authenticate,
  RoleValidator.checkUserRole(
    ['Super Administrator', 'Travel Administrator', 'Travel Team Member']
  ),
  ReminderEmailTemplateValidator.validateReminderEmailTemplate,
  ReminderEmailTemplateValidator.validateCCEmails,
  ReminderEmailTemplateValidator.validateUniqueName,
  EmailTemplateController.createEmailTemplate
);

ReminderManagementRouter.get(
  '/reminderManagement/emailTemplates',
  authenticate,
  RoleValidator.checkUserRole(
    ['Super Administrator', 'Travel Administrator', 'Travel Team Member']
  ),
  sanitizeQuery('paginate').toBoolean(),
  sanitizeQuery('disabled').toBoolean(),
  EmailTemplateController.listEmailTemplates,
);

ReminderManagementRouter.put(
  '/reminderManagement/emailTemplates/:templateId',
  authenticate,
  RoleValidator.checkUserRole(
    ['Super Administrator', 'Travel Administrator', 'Travel Team Member']
  ),
  ReminderEmailTemplateValidator.validateReminderEmailTemplate,
  ReminderEmailTemplateValidator.validateCCEmails,
  ReminderEmailTemplateValidator.validateUniqueName,
  EmailTemplateController.updateEmailTemplate

);

ReminderManagementRouter.put(
  '/reminderManagement/emailTemplates/disable/:templateId',
  authenticate,
  RoleValidator.checkUserRole(
    ['Super Administrator', 'Travel Administrator', 'Travel Team Member']
  ),
  ReminderValidator.validateReason,
  ReminderValidator.validateDisability,
  EmailTemplateController.disableEmailTemplate
);

ReminderManagementRouter.get(
  '/reminderManagement/emailTemplates/:templateId',
  authenticate,
  RoleValidator.checkUserRole(
    ['Super Administrator', 'Travel Administrator', 'Travel Team Member']
  ),
  EmailTemplateController.getEmailTemplate

);

ReminderManagementRouter.put(
  '/reminderManagement/emailTemplates/enable/:templateId',
  authenticate,
  RoleValidator.checkUserRole(
    ['Super Administrator', 'Travel Administrator', 'Travel Team Member']
  ),
  ReminderEmailTemplateValidator.validateReqParams,
  EmailTemplateController.enableEmailTemplate,
);

export default ReminderManagementRouter;
