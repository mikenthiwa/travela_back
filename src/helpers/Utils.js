import shortid from 'shortid';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import SimpleCrypto from 'simple-crypto-js';
import webPush from 'web-push';
import models from '../database/models';
import UserRoleController from '../modules/userRole/UserRoleController';
import TravelAdminApprovalController from '../modules/approvals/TravelAdminApprovalController';
import BudgetApprovalsController from '../modules/approvals/BudgetApprovalsController';
import NotificationEngine from '../modules/notifications/NotificationEngine';
import { BudgetCheckerEmail } from './email/RequestEmail';


dotenv.config();

const simpleCrypto = new SimpleCrypto(process.env.JWT_PUBLIC_KEY);

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
    const subscription = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth
      }
    };
    const payload = Buffer.from(JSON.stringify(params), 'utf8');
    webPush.sendNotification(subscription, payload);
  }

  static async sendNotificationToBudgetChecker(request, messageType, messageTopic, messageNotificationType) {
    const {
      id, name, manager, department, picture
    } = request;
    const params = {
      title: 'Approve pending requests.',
      body: 'Confirm availability of budget of trip(s).',
      tag: '/requests/budgets/?page=1&budgetStatus=open',
    };
    const budgetCheckerMembers = await BudgetApprovalsController.findBudgetCheckerDepartment(department);
    const managerDetails = await UserRoleController.getRecipient(null, null, manager);
    if (budgetCheckerMembers.length > 0) {
      await Promise.all(budgetCheckerMembers.map(async (budgetChecker) => {
        const notificationData = {
          senderId: managerDetails.userId,
          senderName: name,
          recipientId: budgetChecker.userId,
          senderImage: picture,
          notificationType: messageNotificationType,
          requestId: id,
          message: `Hi ${budgetChecker.dataValues.fullName}, Please click on ${id} to confirm availability of budget for this trip. You will be required to take an approval decision by clicking on Approve or Reject `,
          notificationLink: `/requests/budgets/${id}`
        };
        NotificationEngine.notify(notificationData);

        const approvalToken = encodeURIComponent(simpleCrypto.encrypt(budgetChecker.email));

        new BudgetCheckerEmail(request.id).send(budgetChecker, messageTopic, {
          managerName: managerDetails.fullName,
          redirectLink: `${process.env.REDIRECT_URL}/redirect/requests/budgets/${id}`,
          approvalLink: `${process.env.REDIRECT_URL}/email-approval/budget/${id}/Approved/${approvalToken}`,
          rejectLink: `${process.env.REDIRECT_URL}/email-approval/budget/${id}/Rejected/${approvalToken}`
        });
        return Utils.pushNotifications(budgetChecker.userId, params);
      })).catch(err => (err));
    }
  }
}

export default Utils;
