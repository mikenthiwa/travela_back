/* eslint-disable no-await-in-loop */
import models from '../../database/models';
import Error from '../../helpers/Error';
import ChecklistWizardController from '../checklistWizard/ChecklistWizardController';
import { validator } from './dynamicChecklistSubmissionValidator';
import TravelChecklistUtils from '../travelChecklist/TravelChecklistUtils';
import TravelChecklistController from '../travelChecklist/TravelChecklistController';
import NotificationEngine from '../notifications/NotificationEngine';


class DynamicChecklistSubmissionsController {
  static async fetchChecklistSubmission(req, res) {
    const { requestId } = req.params;
    try {
      const checklist = await models.DynamicChecklistSubmissions.findOne({
        where: { userId: req.user.UserInfo.id, requestId },
      });
      
      if (!checklist) {
        return await ChecklistWizardController.getChecklistByRequest(req, res);
      }
      return res.status(200).json({
        success: true,
        checklist: {
          ...checklist.checklist,
          updatedAt: checklist.updatedAt,
          completionCount: checklist.completionCount,
          isSubmitted: checklist.isSubmitted,
        },
      });
    } catch (error) { /* istanbul ignore next */
      return Error.handleError('Server Error', 500, res);
    }
  }
  
  static ChecklistReplacer(validChecklistsItems, checklists) {
    const newChecklists = checklists.map((checklist) => {
      const newConfig = checklist.config.map((config) => {
        let validItem = validChecklistsItems.find(item => item.id === config.id);
        
        if (!validItem && config.notApplicable) {
          validItem = { ...config, notApplicable: false };
        }
        
        return validItem || config;
      });
      return { ...checklist, config: newConfig };
    });
    
    return newChecklists;
  }
  
  static validateAndReplaceChecklist(checklist) {
    const [validCheklistItems, validTrips, allChecklistItems, allTrips] = validator(checklist);
    const validCount = validCheklistItems.length + validTrips.length;
    const totalCount = allChecklistItems.length + allTrips.length;
    const completionCount = Math.floor((validCount / totalCount) * 100) || 0;
    const replacedChecklists = DynamicChecklistSubmissionsController
      .ChecklistReplacer(validCheklistItems, checklist.checklists);
    
    return [
      { ...checklist, checklists: replacedChecklists },
      completionCount,
    ];
  }
  
  static async postChecklistSubmission(req, res) {
    const { requestId } = req.params;
    const { isSubmitted: submitted, ...checklist } = req.body;
    const [replacedChecklists, completionCount] = DynamicChecklistSubmissionsController
      .validateAndReplaceChecklist(checklist);
    const isSubmitted = !!(submitted && (completionCount === 100));
    try {
      const [submission] = await models.DynamicChecklistSubmissions.upsert({
        id: checklist.id,
        userId: req.user.UserInfo.id,
        requestId,
        isSubmitted,
        completionCount,
        checklist: replacedChecklists,
      }, { returning: true });
      
      res.status(201).json({
        success: true,
        message: 'Checklist created successfully',
        checklist: {
          ...submission.checklist,
          updatedAt: submission.updatedAt,
          completionCount: submission.completionCount,
          isSubmitted: submission.isSubmitted,
        },
      });
      
      if (isSubmitted) {
        DynamicChecklistSubmissionsController
          .handleEmailNotificationBehaviour(req.user.UserInfo, checklist.checklists);
        DynamicChecklistSubmissionsController.sendEmailNotificationsOnSubmit(req.user, requestId);
      }
    } catch (error) { /* istanbul ignore next */
      return Error.handleError('Server Error', 500, res);
    }
  }
  
  static async sendEmailNotificationsOnSubmit(user, requestId) {
    const request = await models.Request.findByPk(requestId);
    TravelChecklistUtils.notifyRequester(requestId, request);
    TravelChecklistController.sendEmailToTravelAdmin(request, user);
  }
  
  static async getUserByEmail(email) {
    const foundUser = await models.User.findOne({
      where: { email },
      attributes: ['fullName']
    });
    return foundUser ? foundUser.fullName : '';
  }

  static handleEmailNotificationBehaviour(userInfo, checklists) {
    const { name, email, location } = userInfo;
    
    const emailTemplates = checklists.reduce((prev, curr) => prev.concat(curr.config), [])
      .filter(({ response }) => response && response.behaviour && response.behaviour.type === 'NOTIFY_EMAIL')
      .map(({ response }) => response.behaviour.payload);
    
    const replacerMap = new Map([
      ['<name>', name],
      ['<email>', email],
      ['<location>', location],
    ]);
    
    const pattern = '<name>|<email>|<location>';
    
    const regExp = new RegExp(pattern, 'g');
    
    emailTemplates.forEach(async ({ recipient, template }) => {
      const details = template.replace(regExp, value => replacerMap.get(value));
      const recipientName = await DynamicChecklistSubmissionsController.getUserByEmail(recipient);

      NotificationEngine.sendMail({
        recipient: { name: recipientName, email: recipient },
        sender: name,
        topic: 'Checklist Notification',
        type: 'NOTIFY_EMAIL_BEHAVIOUR',
        redirectLink: `${process.env.REDIRECT_URL}/redirect/dashboard`,
        details,
      });
    });
  }
}

export default DynamicChecklistSubmissionsController;
