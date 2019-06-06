import NotificationEngine from '../notifications/NotificationEngine';
import models from '../../database/models';
import TravelChecklistController from './TravelChecklistController';
import TravelChecklistHelper from '../../helpers/travelChecklist/index';
import Utils from '../../helpers/Utils';
import Centers from '../../helpers/centers';

class TravelChecklistUtils {
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

  static async getChecklistItems(req, checklistId) {
    const checklistItem = await models.ChecklistItem.findOne({
      where: { id: checklistId }
    });
    const checklistItemResources = await models.ChecklistItemResource
      .find({ where: { checklistItemId: checklistId } });
    const checklistSubmissions = await models.ChecklistSubmission
      .find({ where: { checklistItemId: checklistId } });

    return { checklistItem, checklistItemResources, checklistSubmissions };
  }

  static async travelChecklistSubmissions(requestId, checklists, res) {
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
    return {
      success, message, percentageCompleted, submissions
    };
  }

  static async submitChecklistDocument({
    tripId, documentId, checklistItemId, file, id, req, res, requestId
  }) {
    const retrievedDoc = await TravelChecklistHelper.retrieveTravelDocumentData(documentId);
    if (!retrievedDoc && documentId) {
      return { error: { msg: `Document with id ${documentId} does not exist`, status: 404 } };
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
    return { percentageCompleted, submission };
  }

  static async getTravelChecklistSubmissions(req, res) {
    const { requestId } = req.params;
    const userId = await models.Request
      .findOne({ raw: true, where: { id: requestId }, attributes: ['userId'] });
    const [userLocation] = await models.User
      .findAll({ raw: true, where: { ...userId }, attributes: ['location'] });
    const location = await Centers.getCenter(userLocation.location);

    let checklists = await TravelChecklistHelper
      .getChecklists(req, res, requestId, location);

    const {
      success, message, percentageCompleted, submissions
    } = await TravelChecklistUtils.travelChecklistSubmissions(requestId, checklists, res);

    const lists = JSON.parse(JSON.stringify(checklists));
    checklists = TravelChecklistHelper
      .combineSubmittedChecklists(lists, submissions);

    return {
      success, message, percentageCompleted, checklists
    };
  }

  static async getSubmissionCompletion(req, res) {
    const { requestId, checklistItemId } = req.params;
    const { file, tripId } = req.body;
    const previousPercentage = await TravelChecklistController
      .checkListPercentageNumber(req, res, requestId);
    const { documentId } = file;
    const id = documentId || null;

    const { percentageCompleted, submission, error } = await TravelChecklistUtils.submitChecklistDocument({
      tripId, documentId, checklistItemId, file, id, req, res, requestId
    });

    if (!error && percentageCompleted >= 100 && previousPercentage < 100) {
      const request = await models.Request.findByPk(requestId);
      TravelChecklistUtils.notifyRequester(requestId, request);
      TravelChecklistController.sendEmailToTravelAdmin(request, req.user);
    }
    return { percentageCompleted, submission, error };
  }

  static async getChecklistItem(req) {
    const { deleteReason } = req.body;
    const { checklistId } = req.params;
    const resources = await TravelChecklistController
      .fetchChecklistItemAndResources(req, checklistId);
    const {
      checklistItem, checklistItemResources, checklistSubmissions
    } = resources;

    if (!checklistItem) {
      return { error: { status: 404, msg: 'Checklist item not found' } };
    }

    await checklistItem.update({ deleteReason });
    await checklistItem.destroy(); /* istanbul ignore next */
    if (checklistItemResources) checklistItemResources.destroy(); /* istanbul ignore next */
    if (checklistSubmissions) checklistSubmissions.destroy(); /* istanbul ignore next */

    return { checklistItem };
  }

  static async updateChecklistUtils(req, res) {
    const andelaCenters = await TravelChecklistHelper.getAndelaCenters();
    const checklistItemId = req.params.checklistId;
    const {
      requiresFiles, name, resources, destinationName, location,
    } = req.body;
    req.query.destinationName = location;

    const checklistItem = await models.ChecklistItem.findOne({
      paranoid: false,
      where: { id: checklistItemId, destinationName: andelaCenters[`${location || destinationName}`] }
    });
    if (checklistItem) {
      if (await TravelChecklistController.checklistItemExists(
        name, req, res, checklistItem.get({ plain: true }).name
      )) {
        return {
          error: {
            msg: 'Travel checklist items are unique, kindly check your input', status: 400
          }
        };
      }
      const checklistItemUpateCompleted = TravelChecklistController.completeChecklistItemUpdate(
        checklistItem, name, requiresFiles, checklistItemId, resources, res
      );
      return { checklistItemUpateCompleted };
    }
    return { error: { msg: 'Checklist item cannot be found', status: 404 } };
  }

  static async createChecklistItem(req, res) {
    const { resources, ...rest } = req.body;
    const { location } = rest;
    const andelaCenters = await TravelChecklistHelper.getAndelaCenters();
    req.query.destinationName = location;
    const runChecklist = await models.sequelize.transaction(async () => {
      if (await TravelChecklistController.checklistItemExists(rest.name, req, res)) {
        return { error: { msg: 'Travel checklist items are unique, kindly check your input', status: 400 } };
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
      return { createdChecklistItem };
    });
    return runChecklist;
  }

  static async checkListPercentageNumber(req, res, requestId) {
    const allChecklists = await TravelChecklistHelper.getChecklists(req, res, requestId);
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
}

export default TravelChecklistUtils;
