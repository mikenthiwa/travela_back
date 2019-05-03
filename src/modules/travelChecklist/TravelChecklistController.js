/* eslint object-property-newline: 0 */
import Utils from '../../helpers/Utils';
import models from '../../database/models';
import TravelChecklistHelper from '../../helpers/travelChecklist';
import TripsController from '../trips/TripsController';
import CustomError from '../../helpers/Error';
import Centers from '../../helpers/centers';
import { getTravelTeamEmailData } from '../../helpers/approvals';
import NotificationEngine from '../notifications/NotificationEngine';

const { Op } = models.Sequelize;

export default class TravelChecklistController {
  static async createChecklistItem(req, res) {
    try {
      const { resources, ...rest } = req.body;
      const { location } = req.user;
      const andelaCenters = await TravelChecklistHelper.getAndelaCenters();
      req.query.destinationName = location;
      await models.sequelize.transaction(async () => {
        if (await TravelChecklistController.checklistItemExists(rest.name, req, res)) {
          return CustomError.handleError(
            'Travel checklist items are unique, kindly check your input', 400, res
          );
        }
        const createdChecklistItem = await models.ChecklistItem.create({
          ...rest,
          id: Utils.generateUniqueId(),
          destinationName: andelaCenters[`${location}`]
        });
        let createdResources = [];
        if (resources.length) {
          const modifiedResources = TravelChecklistController.addChecklistItemId(
            createdChecklistItem.id, resources
          );

          createdResources = await models.ChecklistItemResource.bulkCreate(
            modifiedResources
          );
        }
        createdChecklistItem.dataValues.resources = createdResources;
        return res.status(201).json({
          success: true,
          message: 'Check list item created successfully',
          checklistItem: createdChecklistItem
        });
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
      const { requestId } = req.query;
      const checklists = await TravelChecklistHelper.getChecklists(req, res, requestId);
      const response = {
        success: true,
        message: 'travel checklist retrieved successfully',
        travelChecklists: checklists,
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
      const { destinationName } = req.query;
      const andelaCenters = await TravelChecklistHelper.getAndelaCenters();
      const ChecklistItems = await models.ChecklistItem
        .findAll({
          paranoid: false,
          where: {
            deletedAt: {
              [Op.ne]: null
            },
            destinationName: andelaCenters[`${destinationName}`]
          },
          include: {
            model: models.ChecklistItemResource,
            as: 'resources',
            paranoid: false,
            attributes: ['id', 'label', 'link', 'checklistItemId']
          }
        });
      if (ChecklistItems.length) {
        return res.status(200).json({
          success: true,
          message: 'deleted travel checklist items retrieved successfully',
          deletedTravelChecklists: ChecklistItems
        });
      }
      const errorMsg = 'There are currently no deleted travel checklist items for your location'; // eslint-disable-line
      CustomError.handleError(errorMsg, 404, res);
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
      const request = await TravelChecklistController
        .getApprovedRequest('Approved', requestId, res);
      let where = {};
      let submissions = [];
      const trips = await TripsController.getTripsByRequestId(requestId, res);
      const tripsId = trips.map(trip => trip.id);
      where = {
        tripId: { [Op.in]: tripsId }
      };

      if (request) {
        submissions = await models.ChecklistSubmission.findAll({
          where,
          include: [{
            model: models.ChecklistItem,
            as: 'checklistSubmissions',
            attributes: ['id']
          },
          {
            model: models.TravelReadinessDocuments,
            as: 'documentSubmission',
            attributes: ['id', 'data']
          }]
        });
      }
      return submissions;
    } catch (error) { /* istanbul ignore next */
      CustomError.handleError(error, 500, res);
    }
  }

  static async checkListPercentageNumber(req, res, requestId) {
    const allChecklists = await TravelChecklistHelper
      .getChecklists(req, res, requestId);
    const { location } = await models.User.findOne({
      where: { userId: req.user.UserInfo.id }
    });
    // the checklist needed for this trip
    const neededChecklist = allChecklists.map(
      (checklist) => {
        const newChecklist = { ...checklist };
        if (RegExp(location).test(checklist.destinationName)) {
          newChecklist.checklist = checklist.checklist
            .filter(checklistItem => checklistItem.destinationName === 'Default');
        }
        return newChecklist;
      }
    );
    const submissions = await TravelChecklistController
      .getSubmissions(requestId, res);
    const percentage = TravelChecklistController
      .calcPercentage(neededChecklist, submissions);
    return percentage;
  }

  static async calcPercentage(checklists, submissions) {
    const reducer = (accumulator, item) => accumulator + item.checklist.length;
    const checklistLength = checklists.reduce(reducer, 0);
    const percentage = Math
      .floor((submissions.length / checklistLength) * 100);
    return percentage >= 100 ? 100 : percentage;
  }

  static notifyRequester(requestId, requestData) {
    const {
      userId,
      name,
      picture
    } = requestData;
    const message = `Hi ${name}, 
    Congratulations, you have now responded to all the 
    checklist requirements for your trip ${requestId}.
    The travel team will review your submissions and 
    advise accordingly.`;
    const notificationData = {
      senderId: userId,
      recipientId: userId,
      notificationType: 'general',
      senderName: name,
      notificationStatus: 'unread',
      notificationLink: `/requests/${requestId}`,
      senderImage: picture,
      message,
    };
    NotificationEngine.notify(notificationData);
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
      const { location } = req.user;
      const andelaCenters = await TravelChecklistHelper.getAndelaCenters();
      const checklistItemId = req.params.checklistId;
      req.query.destinationName = location;

      const { name, requiresFiles, resources } = req.body;
      const checklistItem = await models.ChecklistItem.findOne({
        paranoid: false,
        where: { id: checklistItemId, destinationName: andelaCenters[`${location}`] }
      });
      if (checklistItem) {
        if (await TravelChecklistController.checklistItemExists(
          name, req, res, checklistItem.get({ plain: true }).name
        )) {
          return CustomError.handleError(
            'Travel checklist items are unique, kindly check your input', 400, res
          );
        }
        return TravelChecklistController.completeChecklistItemUpdate(
          checklistItem, name, requiresFiles, checklistItemId, resources, res
        );
      }
      return CustomError.handleError('Checklist item cannot be found', 404, res);
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
    const andelaCenters = await TravelChecklistHelper.getAndelaCenters();
    const { location } = req.user;
    const checklistItem = await models.ChecklistItem.findOne({
      where: { id: checklistId, destinationName: andelaCenters[`${location}`] }
    });
    const checklistItemResources = await models.ChecklistItemResource
      .find({ where: { checklistItemId: checklistId } });
    const checklistSubmissions = await models.ChecklistSubmission
      .find({ where: { checklistItemId: checklistId } });
    return { checklistItem, checklistItemResources, checklistSubmissions };
  }

  static async deleteChecklistItem(req, res) {
    try {
      const { deleteReason } = req.body;
      const { checklistId } = req.params;
      const resources = await TravelChecklistController
        .fetchChecklistItemAndResources(req, checklistId);

      const {
        checklistItem, checklistItemResources, checklistSubmissions
      } = resources;

      if (!checklistItem) {
        return res.status(404).json({
          success: false, message: 'Checklist item not found'
        });
      }
      await checklistItem.update({ deleteReason });
      await checklistItem.destroy(); /* istanbul ignore next */
      if (checklistItemResources) checklistItemResources.destroy(); /* istanbul ignore next */
      if (checklistSubmissions) checklistSubmissions.destroy(); /* istanbul ignore next */
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
      const { requestId, checklistItemId } = req.params;
      const { file, tripId } = req.body;
      const previousPercentage = await TravelChecklistController
        .checkListPercentageNumber(req, res, requestId);
      const { documentId } = file;
      const id = documentId || null;
      
      const retrievedDoc = await TravelChecklistHelper.retrieveTravelDocumentData(documentId);
      if (!retrievedDoc && documentId) {
        return res.status(404).json({
          success: false,
          message: `Document with id ${documentId} does not exist`,
        });
      }
      const value = TravelChecklistHelper.generateChecklistValue(id, retrievedDoc, file);
      const query = {
        where: { tripId, checklistItemId },
        defaults: { value, id: Utils.generateUniqueId(), documentId: id },
      };
      const submit = await models.ChecklistSubmission.findOrCreate(query);
      const [submission, created] = submit;
      if (!created) {
        submission.value = file;
        submission.documentId = id;
        await submission.save();
      }

      const percentageCompleted = await TravelChecklistController
        .checkListPercentageNumber(req, res, requestId);
      if (percentageCompleted >= 100 && previousPercentage < 100) {
        const request = await models.Request.findByPk(requestId);
        TravelChecklistController.notifyRequester(requestId, request);
        TravelChecklistController.sendEmailToTravelAdmin(request, req.user);
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
      const { requestId } = req.params;
      const userId = await models.Request
        .findOne({ raw: true, where: { id: requestId }, attributes: ['userId'] });
      const [userLocation] = await models.User
        .findAll({ raw: true, where: { ...userId }, attributes: ['location'] });
      const location = await Centers.getCenter(userLocation.location);

      let checklists = await TravelChecklistHelper
        .getChecklists(req, res, requestId, location);
      let submissions = await TravelChecklistController
        .getSubmissions(requestId, res);

      let success = false;
      let message = 'No checklist have been submitted';
      let percentageCompleted = 0;
      if (submissions.length > 0) {
        submissions = JSON.parse(JSON.stringify(submissions));
        submissions = submissions.map((submission) => {
          let { value } = submission;
          const { documentSubmission, documentId } = submission;
          if (documentId) {
            const { data: { imageName, cloudinaryUrl } } = documentSubmission;
            value = { fileName: imageName, url: cloudinaryUrl };
            value = JSON.stringify(value);
          }
          value = JSON.parse(value);
          // eslint-disable-next-line no-param-reassign
          delete submission.documentSubmission;
          return { ...submission, value };
        });
        percentageCompleted = await TravelChecklistController
          .calcPercentage(checklists, submissions);
        success = true;
        message = 'Checklist with submissions retrieved successfully';
      }

      const lists = JSON.parse(JSON.stringify(checklists));
      checklists = TravelChecklistHelper
        .combineSubmittedChecklists(lists, submissions);

      return res.status(200).json({
        success, message, percentageCompleted,
        submissions: checklists
      });
    } catch (error) { /* istanbul ignore next */
      return CustomError.handleError(error, 500, res);
    }
  }
}
