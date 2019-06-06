/* eslint object-property-newline: 0 */
import Utils from '../../helpers/Utils';
import models from '../../database/models';
import TravelChecklistHelper from '../../helpers/travelChecklist';
import CustomError from '../../helpers/Error';
import { getTravelTeamEmailData } from '../../helpers/approvals';
import NotificationEngine from '../notifications/NotificationEngine';
import UserRoleController from '../userRole/UserRoleController';
import TravelAdminApprovalController from '../approvals/TravelAdminApprovalController';
import TravelChecklistUtils from './TravelChecklistUtils';

export default class TravelChecklistController {
  static async createChecklistItem(req, res) {
    try {
      const {
        error, createdChecklistItem
      } = await TravelChecklistUtils.createChecklistItem(req, res);
      if (error) return CustomError.handleError(error.msg, error.status, res);
      
      return res.status(201).json({
        success: true,
        message: 'Check list item created successfully',
        checklistItem: createdChecklistItem
      });
    } catch (error) { /* istanbul ignore next */
      CustomError.handleError(error.message, 500, res);
    }
  }

  static async checklistItemExists(checklistName, req, res, currentName = '') {
    const checklists = await TravelChecklistHelper
      .getChecklists(req, res);
    const checklistNames = checklists.length ? checklists[0].checklist.map(
      checklist => checklist.get({ plain: true }).name
        .toLowerCase()
        .replace(/\s/g, '')
    ) : [];

    return checklistNames.filter(name => (
      checklistName.toLowerCase().replace(/\s/g, '') === name
    )).length !== 0
      && (currentName.toLowerCase().replace(/\s/g, '') !== checklistName.toLowerCase()
        .replace(/\s/g, ''));
  }

  static addChecklistItemId(checklistItemId, resources) {
    return resources.map(resource => ({
      ...resource,
      checklistItemId,
      id: Utils.generateUniqueId()
    }));
  }

  static async getChecklistsResponse(req, res) {
    try {
      const user = await UserRoleController.findUserDetails(req);
      const userCenters = TravelAdminApprovalController.getAdminCenter(user);
      const { requestId } = req.query;
      const checklists = await TravelChecklistHelper.getChecklists(req, res, requestId);
      const response = {
        success: true,
        message: 'travel checklist retrieved successfully',
        travelChecklists: checklists,
        userCenters
      };
      if (checklists.length) return res.status(200).json(response);

      const errorMsg = 'There are no checklist items for your selected destination(s). Please contact your Travel Department.'; // eslint-disable-line
      return CustomError.handleError(errorMsg, 404, res);
    } catch (error) { /* istanbul ignore next */
      CustomError.handleError(error, 500, res);
    }
  }

  static async getDeletedChecklistItems(req, res) {
    try {
      const {
        error, deletedTravelChecklists
      } = await TravelChecklistHelper.getDeletedChecklist(req);
      if (error) return CustomError.handleError(error.msg, error.status, res);
      return res.status(200).json({
        success: true,
        message: 'deleted travel checklist items retrieved successfully',
        deletedTravelChecklists
      });
    } catch (error) { /* istanbul ignore next */
      CustomError.handleError(error, 500, res);
    }
  }

  static async getApprovedRequest(type, requestId, res) {
    try {
      const filter = [type];
      const enums = await models.sequelize
        .query('SELECT enumlabel from pg_enum where enumlabel = \'Verified\' ;');
      if (enums[0].length > 1) filter.push('Verified');
      const requestType = await models.Request.findOne({
        where: {
          status: filter,
          id: requestId,
        }
      });
      return requestType;
    } catch (error) { /* istanbul ignore next */
      CustomError.handleError(error, 500, res);
    }
  }

  static async getSubmissions(requestId, res) {
    try {
      const submissions = await TravelChecklistHelper.getTravelSubmissions(requestId, res);
      return submissions;
    } catch (error) { /* istanbul ignore next */
      CustomError.handleError(error, 500, res);
    }
  }

  static async checkListPercentageNumber(req, res, requestId) {
    const percentage = await TravelChecklistUtils.checkListPercentageNumber(req, res, requestId);
    return percentage;
  }

  static async calcPercentage(checklists, submissions) {
    const reducer = (accumulator, item) => accumulator + item.checklist.length;
    const checklistLength = checklists.reduce(reducer, 0);
    const percentage = Math
      .floor((submissions.length / checklistLength) * 100);
    return percentage >= 100 ? 100 : percentage;
  }


  static async checkListPercentage(req, res, requestId) {
    const requestData = await models.Request.findByPk(requestId);
    const { status } = requestData;
    const percentage = await TravelChecklistController
      .checkListPercentageNumber(req, res, requestId);
    if (status === 'Verified') return '100% complete';
    const completedPercentage = `${isNaN(percentage) ? 0 : percentage}% complete`; // eslint-disable-line
    return completedPercentage;
  }

  static async updateResources(checklistItemId, resources) {
    await models.ChecklistItemResource.destroy({ where: { checklistItemId }, force: true });
    const newResources = TravelChecklistController
      .addChecklistItemId(checklistItemId, resources);
    await models.ChecklistItemResource.bulkCreate(newResources);
    const updatedResources = await models.ChecklistItemResource
      .findAll({ where: { checklistItemId } });
    return updatedResources;
  }

  static async updateChecklistItem(req, res) {
    try {
      const {
        error, checklistItemUpateCompleted
      } = await TravelChecklistUtils.updateChecklistUtils(req, res);
      if (error) return CustomError.handleError(error.msg, error.status, res);
      return checklistItemUpateCompleted;
    } catch (error) { /* istanbul ignore next */
      return CustomError.handleError('Server Error', 500, res);
    }
  }

  static async completeChecklistItemUpdate(checklistItem,
    name, requiresFiles, checklistItemId, resources, res) {
    const responseMessage = checklistItem.dataValues.deletedAt === null
      ? 'Checklist item successfully updated' : 'Checklist item successfully restored';
    const updatedChecklistItem = await checklistItem.update({
      name, requiresFiles, deletedAt: null, deleteReason: null
    });
    checklistItem.setDataValue('deletedAt', null);
    checklistItem.save();
    const updatedResources = await TravelChecklistController.updateResources(checklistItemId, resources); // eslint-disable-line
    return res.status(200).json({
      success: true,
      message: responseMessage,
      updatedChecklistItem: {
        name: updatedChecklistItem.name, resources: updatedResources,
        destinationName: updatedChecklistItem.destinationName,
        deletedAt: updatedChecklistItem.deletedAt, requiresFiles: updatedChecklistItem.requiresFiles, // eslint-disable-line
      }
    });
  }

  static async fetchChecklistItemAndResources(req, checklistId) {
    const {
      checklistItem, checklistItemResources, checklistSubmissions
    } = await TravelChecklistUtils.getChecklistItems(req, checklistId);
    return { checklistItem, checklistItemResources, checklistSubmissions };
  }

  static async deleteChecklistItem(req, res) {
    try {
      const { error, checklistItem } = await TravelChecklistUtils.getChecklistItem(req);
      if (error) {
        return res.status(error.status).json({ success: false, message: error.msg });
      }
      return res.status(200).json({
        success: true,
        message: 'Checklist item deleted successfully',
        checklistItem
      });
    } catch (error) { /* istanbul ignore next */
      CustomError.handleError(error.stack, 500, res);
    }
  }

  static async addChecklistItemSubmission(req, res) {
    try {
      const {
        percentageCompleted, submission, error
      } = await TravelChecklistUtils.getSubmissionCompletion(req, res);
      if (error) {
        return res.status(error.status).json({
          success: false,
          message: error.msg,
        });
      }
      res.status(201).json({
        success: true, message: 'Submission uploaded successfully',
        percentageCompleted, submission
      });
    } catch (error) { /* istanbul ignore next */
      return CustomError.handleError(error, 500, res);
    }
  }

  static async sendEmailToTravelAdmin(request, user) {
    const { UserInfo: { name } } = user;
    const data = await getTravelTeamEmailData(request, name,
      'Notify Travel Admins Checklist Completion',
      '100% Checklist Completion');

    if (data) {
      NotificationEngine.sendMailToMany(data.travelAdmins, data.data);
    }
  }

  static async getCheckListItemSubmission(req, res) {
    try {
      const {
        success, message, percentageCompleted, checklists
      } = await TravelChecklistUtils.getTravelChecklistSubmissions(req, res);

      return res.status(200).json({
        success, message, percentageCompleted,
        submissions: checklists
      });
    } catch (error) { /* istanbul ignore next */
      return CustomError.handleError(error, 500, res);
    }
  }
}
