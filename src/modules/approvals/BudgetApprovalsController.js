import moment from 'moment';
import _ from 'lodash';
import UserRoleController from '../userRole/UserRoleController';
import { validateBudgetChecker } from '../../helpers/approvals';
import Pagination from '../../helpers/Pagination';
import TravelReadinessUtils from '../travelReadinessDocuments/TravelReadinessUtils';
import NotificationEngine from '../notifications/NotificationEngine';
import models from '../../database/models';
import Error from '../../helpers/Error';
import ApprovalsController from './ApprovalsController';

const { Op } = models.Sequelize;


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


  static async calculateApprovals(status, where) {
    const result = await models.Request.count({
      where: {
        ...where,
        budgetStatus: status
      }
    });
    return result;
  }

  static returnResponse(res, approvals, open, past, pagination) {
    res.status(200).json({
      success: true,
      message: 'Approvals retrieved successfully',
      approvals: approvals.rows,
      meta: { count: { open, past }, pagination }
    });
  }

  static async getBudgetApprovals(req, res) {
    try {
      const user = await UserRoleController.findUserDetails(req);
      const { query: { budgetStatus } } = req;
      const dept = user.budgetCheckerDepartments.map(departments => departments.name);
      const where = {
        status: 'Approved',
        department: { [Op.iLike]: { [Op.any]: dept } },
      };
      const pastApprovals = { [Op.in]: ['Approved', 'Rejected'] };
      if (budgetStatus) {
        if (budgetStatus === 'open') {
          where.budgetStatus = _.capitalize(budgetStatus);
        } else {
          where.budgetStatus = pastApprovals;
        }
      }
      const { page, limit, offset } = await Pagination.initializePagination(req);
      const approvals = await models.Request.findAndCountAll({
        where,
        offset,
        limit,
        include: [{ model: models.Trip, as: 'trips' }],
        order: [['createdAt', 'DESC']]
      });
      const pagination = Pagination.getPaginationData(page, limit, approvals.count);
      const open = await BudgetApprovalsController.calculateApprovals('Open', where);
      const past = await BudgetApprovalsController.calculateApprovals(pastApprovals, where);
      return BudgetApprovalsController.returnResponse(res, approvals, open, past, pagination);
    } catch (error) { /* istanbul ignore next */
      return res.status(400).json({ error });
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
      }/* istanbul ignore next */
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
