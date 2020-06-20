import * as _ from 'lodash';
import models from '../../database/models';
import CustomError from '../../helpers/Error';
import RemindersController from '../reminders/remindersController';
import {
  paginateTemplates,
  paginateWithQuery,
  searchEmailTemplates,
  include,
  order
} from '../../helpers/reminderManagement/emailTemplatePagination';

export default class EmailTemplateController {
  static async createEmailTemplate(req, res) {
    try {
      const { user: { UserInfo: { id } } } = req;
      const user = await models.User.findOne({
        where: {
          userId: id,
        },
        attributes: ['id', 'fullName', 'email', 'userId']
      });
      const data = {
        ...req.body,
        createdBy: user.id
      };
      data.cc = _.uniq(data.cc).join(',');
      const reminderEmailTemplate = await models.ReminderEmailTemplate.create(data);
      reminderEmailTemplate.creator = user;
      res.status(201).json({
        success: true,
        message: 'Reminder Email Template created successfully',
        reminderEmailTemplate
      });
    } catch (error) {
      /* istanbul ignore next */
      CustomError.handleError(error.message, 500, res);
    }
  }

  static async listEmailTemplates(req, res) {
    try {
      let limit = req.query.limit || 10;
      const {
        query: {
          page, search, disabled, paginate
        }
      } = req;
      const where = disabled === undefined ? {} : {
        disabled,
      };
      const count = search
        ? await models.ReminderEmailTemplate.count(searchEmailTemplates(search))
        : await models.ReminderEmailTemplate.count(
          {
            where,
            paranoid: false,
          }
        );
      if (paginate === false) {
        limit = count;
      }
      const pageCount = Math.ceil(count / limit);
      const currentPage = page < 1 || !page || pageCount === 0 ? 1 : Math.min(page, pageCount);
      const offset = limit * (currentPage - 1);
      const templates = search
        ? await paginateWithQuery(limit, offset, search)
        : await paginateTemplates(limit, offset, _.omitBy({ disabled }, _.isNil));
      const output = {
        success: true,
        message: 'success',
        metaData: {
          templates,
          pagination: {
            pageCount,
            currentPage,
            totalCount: count
          }
        }
      };
      res.status(200).json(output);
    } catch (error) {
      /* istanbul ignore next */
      CustomError.handleError(error.message, 500, res);
    }
  }

  static async updateEmailTemplate(req, res) {
    try {
      const { params: { templateId } } = req;
      const templateData = {
        ...req.body
      };
      templateData.cc = templateData.cc.join(',');

      const reminderEmailTemplate = await models.ReminderEmailTemplate.findById(templateId, {
        returning: true
      });

      if (!reminderEmailTemplate) {
        return CustomError.handleError('Email template does not exist!', 404, res);
      }
      if (reminderEmailTemplate.disabled) {
        return CustomError.handleError(
          `${reminderEmailTemplate.name} has been disabled`, 400, res
        );
      }
      await reminderEmailTemplate.update(
        templateData,
        {
          where: { id: templateId },
          fields: [
            'name', 'from', 'cc', 'message', 'subject'
          ]
        }
      );
      return res.status(200).json({
        success: true,
        message: 'Email template updated successfully',
        reminderEmailTemplate
      });
    } catch (error) {
      /* istanbul ignore next */
      CustomError.handleError(error.message, 500, res);
    }
  }

  static async disableEmailTemplate(req, res) {
    try {
      const { templateId } = req.params;
      const emailTemplate = await models.ReminderEmailTemplate.findOne({
        where: { id: parseInt(templateId, 10) }
      });
      const Reason = await RemindersController.createDisableReason(
        req, 'reminderEmailTemplateId', emailTemplate
      );
      await emailTemplate.update({ disabled: true, });
      const disabledTemplate = await models.ReminderEmailTemplate.findOne({
        where: { id: parseInt(templateId, 10) },
        include,
        order
      });
      return res.status(200).json({
        success: true,
        message: `${emailTemplate.name} has been successfully disabled`,
        updatedTemplate: disabledTemplate,
        reason: Reason
      });
    } catch (error) {
      /* istanbul ignore next */
      CustomError.handleError(error.message, 500, res);
    }
  }

  static async getEmailTemplate(req, res) {
    try {
      const { templateId } = req.params;

      const reminderEmailTemplate = await models.ReminderEmailTemplate.findById(templateId, {
        include: [
          {
            model: models.User,
            as: 'creator',
            attributes: [
              'id', 'fullName', 'email',
              'department'
            ]
          }
        ]
      });

      if (!reminderEmailTemplate) {
        return res.status(404).json({
          success: false,
          message: 'Email template does not exist!'
        });
      }

      return res.status(200).json({
        success: true,
        reminderEmailTemplate
      });
    } catch (error) {
      /* istanbul ignore next */
      CustomError.handleError(error.message, 500, res);
    }
  }

  static async enableEmailTemplate(req, res) {
    try {
      const { templateId } = req.params;
      const emailTemplate = await models.ReminderEmailTemplate.findById(templateId);
      if (!emailTemplate) {
        return res.status(404).json({
          success: false,
          message: 'Reminder email Template does not exist',
        });
      }
      await emailTemplate.update({
        disabled: false,
      });
      return res.status(200).json({
        success: true,
        message: `${emailTemplate.name} email template has been successfully enabled`,
        updatedTemplate: emailTemplate,
      });
    } catch (error) {
      /* istanbul ignore next */
      CustomError.handleError(error.message, 500, res);
    }
  }
}
