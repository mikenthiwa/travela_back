import models from '../../database/models';
import { asyncWrapper, retrieveParams } from '../../helpers/requests';
import {
  countByStatus,
  getTotalCount,
  countVerifiedByStatus
} from '../../helpers/requests/paginationHelper';
import {
  createApprovalSubquery,
  getTravelTeamEmailData,
  emailTopic
} from '../../helpers/approvals';
import Error from '../../helpers/Error';
import Pagination from '../../helpers/Pagination';
import Utils from '../../helpers/Utils';
import NotificationEngine from '../notifications/NotificationEngine';
import UserRoleController from '../userRole/UserRoleController';
import TravelChecklistController from '../travelChecklist/TravelChecklistController';
import BudgetApprovalsController from './BudgetApprovalsController';
import TravelReadinessUtils from '../travelReadinessDocuments/TravelReadinessUtils';

const noResult = 'No records found';
let params = {};
class ApprovalsController {
  static fillWithRequestData(approval) {
    const request = approval.Request;
    request.status = approval.status;
    return request;
  }

  static async createApproval({ id, manager, status }) {
    const approvalData = { requestId: id, approverId: manager, status };
    const newApproval = await models.Approval.create(approvalData);
    return newApproval;
  }

  static setParameters(req) {
    params = retrieveParams(req);
    params.userName = req.travelaUser.fullName;
    params.parameters = {
      req,
      limit: params.limit,
      offset: params.offset,
      search: params.search
    };
  }

  static async getStatusCount(req, res) {
    const { verified, checkBudget } = req.query;
    const { location } = req.user;
    let count;
    if (verified && !checkBudget) {
      count = await asyncWrapper(
        res,
        countVerifiedByStatus,
        models.Approval,
        location,
        params.search
      );
    } else {
      count = await asyncWrapper(
        res,
        countByStatus,
        models.Approval,
        params.userName,
        params.search,
        checkBudget,
        location
      );
    }
    return count;
  }

  static async sendResult(req, res, result) {
    const count = await ApprovalsController.getStatusCount(req, res);
    const pagination = Pagination.getPaginationData(
      params.page,
      params.limit,
      getTotalCount(params.status, count)
    );

    const { fillWithRequestData } = ApprovalsController;
    const message = params.search && !result.count
      ? noResult
      : Utils.getResponseMessage(pagination, params.status, 'Approval');
    const approvals = result.rows.map(fillWithRequestData);
    const newRequest = await Promise.all(
      approvals.map(async (request) => {
        const travelCompletion = await TravelChecklistController.checkListPercentage(
          req,
          res,
          request.id
        );
        request.dataValues.travelCompletion = travelCompletion;
        return request;
      })
    );
    return res.status(200).json({
      success: true,
      message,
      approvals: newRequest,
      meta: { count, pagination }
    });
  }

  static async getApprovalsFromDb(subquery) {
    const result = await models.Approval.findAndCountAll(subquery);
    return result;
  }

  static async processQuery(req, res) {
    ApprovalsController.setParameters(req);
    try {
      const subquery = createApprovalSubquery({
        ...params.parameters,
        searchRequest: true
      });
      let result = { count: 0 };
      result = await asyncWrapper(
        res,
        ApprovalsController.getApprovalsFromDb,
        subquery
      );
      return ApprovalsController.sendResult(req, res, result);
    } catch (error) {
      /* istanbul ignore next */
      throw error;
    }
  }

  static async getUserApprovals(req, res) {
    try {
      await ApprovalsController.processQuery(req, res);
    } catch (error) {
      /* istanbul ignore next */
      return Error.handleError('Server error', 500, res);
    }
  }

  // updates request table with new request
  static async updateRequestStatus(req, res) {
    const { newStatus } = req.body;
    const { request, user } = req;
    try {
      const updateApproval = await ApprovalsController.updateApprovals(
        req,
        res,
        [request, newStatus, user]
      );
      if (updateApproval.approverId) {
        const updatedRequest = await request.update({
          status: newStatus
        });
        if (newStatus === 'Approved') {
          ApprovalsController.sendNotificationToTravelAdmin(
            user,
            updatedRequest
          );
        }
        ApprovalsController.sendNotificationAfterApproval(
          req,
          user,
          updatedRequest,
          res
        );
        await BudgetApprovalsController.notifyBudgetChecker(
          updatedRequest
        );
        await ApprovalsController.generateCountAndMessage(res, updatedRequest);
      }
    } catch (error) {
      /* istanbul ignore next */
      return Error.handleError(error, 500, res);
    }
  }

  // updates approval table with new request status
  static async updateApprovals(req, res, request) {
    const requestToApprove = await models.Approval.find({
      where: { requestId: request[0].id }
    });
    const requestError = BudgetApprovalsController.noRequest(requestToApprove);
    if (requestError) {
      return Error.handleError(requestError, 404, res);
    }
    const { status } = requestToApprove;

    const error = BudgetApprovalsController.approvals(status);
    if (error) {
      return Error.handleError(error, 400, res);
    }
    return requestToApprove.update({ status: request[1] });
  }

  static async generateCountAndMessage(res, updatedRequest) {
    const message = Utils.getRequestStatusUpdateResponse(updatedRequest.status);
    return res.status(200).json({
      success: true,
      message,
      updatedRequest: { request: updatedRequest }
    });
  }

  static setNotificationMessage({
    status, budgetStatus, name, id
  }) {
    if (status === 'Approved' && budgetStatus === 'Open') {
      return `Hi ${name}
        Now that your travel request <a href="/requests/${id}">${id}</a> has been approved by your manager,
        please be informed that it has been forwarded to budget check.`;
    }
    if (status === 'Approved' && budgetStatus === 'Approved') {
      return `Hi ${name} , Your travel request <a href="/requests/${id}">${id}</a> has passed
      the budget check. Kindly proceed to respond to the requirements of the travel checklist`;
    }
    if (status === 'Rejected' || budgetStatus === 'Rejected') return 'rejected your request';
  }

  // eslint-disable-next-line
  static async sendNotificationAfterApproval(req, user, updatedRequest, res) {
    const {
      status, id, userId, budgetStatus,
    } = updatedRequest;
    const { name: userName, picture } = user.UserInfo;
    const recipientEmail = await UserRoleController.getRecipient(null, userId);
    const notificationData = {
      senderId: user.UserInfo.id,
      senderName: userName,
      senderImage: picture,
      recipientId: userId,
      notificationType: 'general',
      requestId: id,
      message: ApprovalsController.setNotificationMessage(updatedRequest),
      notificationLink: `/requests/${id}`
    };

    const budgetEmailData = ApprovalsController.emailData(updatedRequest, recipientEmail, userName);
    const managerEmailData = ApprovalsController.managerData(updatedRequest, recipientEmail, userName);
    const budgetRejectedData = ApprovalsController.budgetRejectData(updatedRequest, recipientEmail, userName);

    ApprovalsController.notify(
      status,
      budgetStatus,
      budgetEmailData,
      managerEmailData,
      notificationData,
      budgetRejectedData
    );
  }

  static notify(
    status,
    budgetStatus,
    budgetEmailData,
    managerEmailData,
    notificationData,
    budgetRejectedData
  ) {
    if (status !== 'Open' && budgetStatus === 'Open') {
      NotificationEngine.notify(notificationData);
      NotificationEngine.sendMail(managerEmailData);
    }
    if (budgetStatus === 'Approved') {
      NotificationEngine.notify(notificationData);
      NotificationEngine.sendMail(budgetEmailData);
    }
    if (budgetStatus === 'Rejected') {
      NotificationEngine.notify(notificationData);
      NotificationEngine.sendMail(budgetRejectedData);
    }
  }

  static emailData(request, recipient, name) {
    return {
      recipient: {
        name: request.name,
        email: recipient && recipient.email
      },
      sender: name,
      topic: 'Travela Budget Approved Request',
      type: 'Budget Approval',
      redirectLink: `${process.env.REDIRECT_URL}/redirect/requests/${
        request.id
      }/checklist`,
      requestId: request.id
    };
  }

  static managerData(request, recipient, name) {
    const msg = emailTopic(request);
    return {
      recipient: {
        name: request.name,
        email: recipient && recipient.email
      },
      sender: name,
      topic: msg,
      type: request.status,
      redirectLink: `${process.env.REDIRECT_URL}/requests/${request.id}`,
      requestId: request.id
    };
  }

  static budgetRejectData(request, recipient, name) {
    const msg = emailTopic(request);
    return {
      recipient: {
        name: request.name,
        email: recipient && recipient.email
      },
      sender: name,
      topic: msg,
      type: 'Budget Rejected',
      redirectLink: `${process.env.REDIRECT_URL}/requests/${request.id}`,
      requestId: request.id
    };
  }

  // Finance team email notification
  static async sendEmailTofinanceMembers(updatedRequest, user) {
    try {
      const { userId: requesterId, name: requesterName, id } = updatedRequest;
      const {
        UserInfo: { name: budgetCheckerName }
      } = user;

      const { location: requesterLocation } = await models.User.findOne({
        where: {
          userId: requesterId
        }
      });

      const {
        users: finaceTeamMembers
      } = await UserRoleController.calculateUserRole('70001');

      const financeMembers = await TravelReadinessUtils.getRoleMembers(
        finaceTeamMembers,
        requesterLocation
      );

      const data = {
        topic: `Successful Budget Check for ${requesterName}'s Trip`,
        type: 'Notify finance team',
        details: { requesterName, budgetCheckerName, id },
        redirectLink: `${process.env.REDIRECT_URL}/requests/budgets/${id}`
      };

      // 4.Test this
      if (financeMembers.length) {
        NotificationEngine.sendMailToMany(financeMembers, data);
      }
    } catch (error) {
      /* istanbul ignore next */
      return error;
    }
  }

  static async sendNotificationToTravelAdmin(user, updatedRequest) {
    const {
      UserInfo: { name }
    } = user;
    const data = await getTravelTeamEmailData(updatedRequest, name);

    if (data) {
      const { travelAdmins, data: emailData } = data;
      NotificationEngine.sendMailToMany(travelAdmins, emailData);
    }
  }
}

export default ApprovalsController;
