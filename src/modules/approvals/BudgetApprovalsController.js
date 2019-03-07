import moment from 'moment';
import _ from 'lodash';
import UserRoleController from '../userRole/UserRoleController';
import { validateBudgetChecker } from '../../helpers/approvals';
import TravelReadinessUtils from '../travelReadinessDocuments/TravelReadinessUtils';
import NotificationEngine from '../notifications/NotificationEngine';
import models from '../../database/models';
import Error from '../../helpers/Error';
import ApprovalsController from './ApprovalsController';

export default class BudgetApprovalsController {
  static async budgetCheckerEmailNotification(
    id,
    userId,
    requesterName,
    manager
  ) {
    const requesterId = userId;
    const { location: userLocation } = await models.User.find({
      where: {
        userId: requesterId
      }
    });
    const { users: budgetChecker } = await UserRoleController.calculateUserRole('60000');
    const budgetCheckerMembers = await TravelReadinessUtils
      .getRoleMembers(budgetChecker, userLocation);
    const data = {
      sender: requesterName,
      topic: 'Travel Request Approval',
      type: 'Notify budget checker',
      details: { RequesterManager: manager, id },
      redirectLink: `${process.env.REDIRECT_URL}/requests/budgets/${id}`
    };
    if (budgetCheckerMembers.length) {
      NotificationEngine.sendMailToMany(
        budgetCheckerMembers,
        data
      );
      return true;
    }
  }


  static async getBudgetApprovals(req, res) {
    const { query: { budgetStatus } } = req;

    req.query.budgetStatus = _.capitalize(budgetStatus);
    req.query.checkBudget = true;

    try {
      await ApprovalsController.processQuery(req, res, true);
    } catch (error) {
      /* istanbul ignore next */
      return Error.handleError('Server error', 500, res);
    }
  }

  static async updateBudgetApprovals(req, res) {
    try {
      const requestToApprove = await models.Approval.find({
        where: { requestId: req.params.requestId }
      });
      const budgeterLocation = await validateBudgetChecker(req);
      const { status, budgetStatus } = requestToApprove;
      const error = BudgetApprovalsController.approvals(budgetStatus);
      if (error) { return Error.handleError(error, 400, res); }
      if (['Approved'].includes(status) && budgeterLocation.result) {
        await models.Approval.update({
          budgetStatus: req.body.budgetStatus,
          budgetApprover: budgeterLocation.name,
          budgetApprovedAt: moment(Date.now()).format('YYYY-MM-DD')
        }, { where: { requestId: req.params.requestId } });
        const updatedRequest = await models.Request.update(
          { budgetStatus: req.body.budgetStatus },
          { where: { id: req.params.requestId }, returning: true }
        );
        await ApprovalsController.sendNotificationAfterApproval(req, req.user, updatedRequest[1][0], res);
        await BudgetApprovalsController.sendNotificationToManager(req, updatedRequest[1][0]);
        if (req.body.budgetStatus === 'Approved') {
          ApprovalsController.sendEmailTofinanceMembers(
            updatedRequest[1][0],
            req.user
          );
        }
        return res.status(200).json({
          success: true,
          message: 'Success',
          updatedRequest: updatedRequest[1][0]
        });
      }
      return Error.handleError(error, 400, res);
    } catch (error) {
      /* istanbul ignore next */
      return Error.handleError(error, 500, res);
    }
  }

  static async sendNotificationToManager(req, updatedRequest) {
    const { id, budgetStatus } = updatedRequest;
    const senderDetails = await validateBudgetChecker(req);
    const { manager } = senderDetails;
    const managerDetails = await UserRoleController.getRecipient(manager, null);
    const managerId = managerDetails.userId;
    const notificationData = {
      senderId: req.user.UserInfo.id,
      senderName: req.user.UserInfo.name,
      senderImage: req.user.UserInfo.picture,
      recipientId: managerId,
      notificationType: 'general',
      requestId: id,
      message: (budgetStatus === 'Approved')
        ? 'approved the budget'
        : 'rejected the request',
      notificationLink: `/my-approvals/${id}`
    };
    return NotificationEngine.notify(notificationData);
  }

  static approvals(status) {
    if (['Approved', 'Rejected'].includes(status)) {
      const error = `Request has been ${status.toLowerCase()} already`;
      return error;
    }
  }
}
