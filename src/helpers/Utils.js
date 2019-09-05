import shortid from 'shortid';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import webPush from 'web-push';
import models from '../database/models';
import UserRoleController from '../modules/userRole/UserRoleController';
import TravelAdminApprovalController from '../modules/approvals/TravelAdminApprovalController';
import BudgetApprovalsController from '../modules/approvals/BudgetApprovalsController';
import NotificationEngine from '../modules/notifications/NotificationEngine';


dotenv.config();

webPush.setVapidDetails(
  `mailto:${process.env.MAIL_SENDER}`,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

class Utils {
  static generateUniqueId() {
    return shortid.generate();
  }

  static generateTestToken(payload) {
    const token = jwt.sign(payload, process.env.JWT_PUBLIC_KEY);
    return token;
  }

  static getResponseMessage(pagination, status, modelName) {
    let message;
    if (pagination.pageCount >= pagination.currentPage) {
      message = `${modelName}s retrieved successfully`;
    } else {
      message = pagination.currentPage === 1 && !status
        ? `You have no ${modelName.toLowerCase()}s at the moment`
        : `No ${modelName.toLowerCase()}s exists for this page`;
    }
    return message;
  }

  static getRequestStatusUpdateResponse(status) {
    return status === 'Approved'
      ? 'Request approved successfully' : 'Request rejected successfully';
  }

  static prependZeroToNumber(value) {
    return (value < 10) ? `0${value}` : value;
  }

  static filterInt(value) {
    if (/^(-|\+)?(\d+|Infinity)$/.test(value)) return Number(value);
    return NaN;
  }

  static async checkAdminCenter(req, center) {
    const user = await UserRoleController.findUserDetails(req);
    const centers = center === 'All Locations' ? (
      await TravelAdminApprovalController.getAdminCenter(user)) : [center];
    const regex = center === 'All Locations' ? (
      JSON.parse(JSON.stringify(centers.map(cen => `.*${cen}.*`).join('|')))) : center;
    return { regex, centers };
  }

  static async pushNotifications(userId, params) {
    const sub = await models.Subscription.findOne({
      attributes: ['p256dh', 'auth', 'endpoint'],
      where: {
        userId
      }
    });
    if (sub) {
      const subscription = {
        endpoint: sub.dataValues.endpoint,
        keys: {
          p256dh: sub.dataValues.p256dh,
          auth: sub.dataValues.auth
        }
      };
      const payload = Buffer.from(JSON.stringify(params), 'utf8');
      webPush.sendNotification(subscription, payload);
    }
  }

  static async sendNotificationToBudgetChecker(request, messageType, messageTopic, messageNotificationType) {
    const {
      id, name, manager, department, picture
    } = request;
    const params = {
      title: 'Reminder to approve pending requests',
      tag: '/requests/budgets/?page=1&budgetStatus=open',
    };
    try {
      const budgetCheckerMembers = await BudgetApprovalsController.findBudgetCheckerDepartment(department);
      const managerDetails = await UserRoleController.getRecipient(null, null, manager);
      if (budgetCheckerMembers.length > 0) {
        const data = {
          sender: name,
          topic: messageTopic,
          type: messageType,
          details: { RequesterManager: managerDetails.fullName, id },
          redirectLink: `${process.env.REDIRECT_URL}/redirect/requests/budgets/${id}`
        };
        await Promise.all(budgetCheckerMembers.map(async (budgetChecker) => {
          const notificationData = {
            senderId: managerDetails.userId,
            senderName: name,
            recipientId: budgetChecker.dataValues.userId,
            senderImage: picture,
            notificationType: messageNotificationType,
            requestId: id,
            message: `Hi ${budgetChecker.dataValues.fullName}, Please click on ${id} to confirm availability of budget for this trip. You will be required to take an approval decision by clicking on Approve or Reject `,
            notificationLink: `/requests/budgets/${id}`
          };
          NotificationEngine.notify(notificationData);
          return Utils.pushNotifications(budgetChecker.dataValues.userId, params);
        }));
        NotificationEngine.sendMailToMany(budgetCheckerMembers, data);
      }
    } catch (error) { /* istanbul ignore next */ return error; }
  }
}

export default Utils;
