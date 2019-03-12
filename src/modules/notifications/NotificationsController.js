import models from '../../database/models';
import Utils from '../../helpers/Utils';
import CustomError from '../../helpers/Error';
import NotificationEngine from './NotificationEngine';
import UserRoleController from '../userRole/UserRoleController';
import CommentsController from '../comments/CommentsController';

class NotificationController {
  static async retrieveNotifications(req, res) {
    try {
      const { id } = req.user.UserInfo;
      const notifications = await models.Notification.findAll({
        where: {
          recipientId: id
        },
        order: [
          ['updatedAt', 'DESC']
        ],
      });
      if (notifications.length !== 0) {
        return res.status(200).json({
          success: true,
          message: 'Notification retrieved successfully',
          notifications,
        });
      }
      return CustomError
        .handleError('You have no notifications at the moment', 404, res);
    } catch (error) { /* istanbul ignore next */
      CustomError.handleError('Server Error', 500, res);
    }
  }

  static async updateNotificationStatus(req, res) {
    const { id } = req.user.UserInfo;
    const { currentStatus, newStatus, notificationType } = req.body;
    const msg = `You have no ${notificationType} notifications at the moment`;
    try {
      const notificationIsUpdated = await models.Notification
        .update({ notificationStatus: newStatus },
          {
            where: {
              notificationStatus: currentStatus,
              recipientId: id,
              notificationType
            }
          });
      if (notificationIsUpdated[0]) {
        return res.status(200).json({
          success: true,
          message:
            `All ${notificationType} notifications have been marked as read`
        });
      } /* istanbul ignore next */

      if (!notificationIsUpdated[0]) {
        throw new Error(msg);
      }
    } catch (error) {
      if (error.message === msg) {
        return CustomError.handleError(error.message, 404, res);
      }
      /* istanbul ignore next */
      return CustomError.handleError('Server Error', 505, res);
    }
  }

  static async markNotificationAsRead(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        return CustomError
          .handleError('Notification id must be an integer', 422, res);
      }
      const notification = await models.Notification.find({
        where: { recipientId: req.user.UserInfo.id, id }
      });
      if (!notification) {
        return CustomError
          .handleError('This notification does not exist', 404, res);
      }
      if (notification.notificationStatus !== 'unread') {
        const error = 'You\'ve already read this notification';
        return CustomError.handleError(error, 409, res);
      }
      const updatedNotification = await notification.updateAttributes({
        notificationStatus: 'read'
      });
      return res.status(200).json({
        success: true,
        message: 'Notification updated successfully',
        notification: updatedNotification,
      });
    } catch (error) { /* istanbul ignore next */
      CustomError.handleError(error.message, 500, res);
    }
  }

  static getCommentData(sender, requestId, comment) {
    const commentData = {
      id: Utils.generateUniqueId(),
      requestId,
      userName: sender.fullName,
      picture: sender.picture,
      userEmail: sender.email,
      comment: `<p>${comment}</p>`,
      isEdited: false
    };
    return commentData;
  }

  /* istanbul ignore next */
  // This function is not being used yet
  // because mailgun API key is needed to make it work
  static async receivedComment(req, res) {
    try {
      const comment = req.body['stripped-text'];
      const separateMessage = req.body.Subject.split('#');
      const [, requestId, recipientId, senderId] = separateMessage;
      const recipient = await UserRoleController.getRecipient(null, recipientId);
      const sender = await UserRoleController.getRecipient(null, senderId);
      const commentData = NotificationController.getCommentData(sender, requestId, comment);
      const newComment = await models.Comment.create(commentData);
      let redirectLink = `/requests/my-approvals/${requestId}`;
      const userRole = await models.UserRole.findOne({
        where: { userId: sender.id }
      });
      if (userRole.roleId === 53019) {
        redirectLink = `/requests/${requestId}`;
      }
      const newNotificationDetail = {
        senderId,
        recipientId,
        notificationType: 'general',
        message: 'posted a comment',
        notificationLink: redirectLink,
        senderName: sender.fullName,
        senderImage: sender.picture
      };
      NotificationEngine.notify(newNotificationDetail);
      CommentsController.sendEmail(senderId, recipient.email,
        recipient.fullName, sender.fullName, redirectLink, requestId, recipientId, newComment);
      return res.status(201).json({
        success: true,
        message: 'Comment created',
        comment: newComment,
      });
    } catch (error) {
      CustomError.handleError(error.message, 500, res);
    }
  }
}

export default NotificationController;
