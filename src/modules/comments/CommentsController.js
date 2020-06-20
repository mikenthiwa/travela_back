import models from '../../database/models';
import Utils from '../../helpers/Utils';
import Error from '../../helpers/Error';
import NotificationEngine from '../notifications/NotificationEngine';
import UserRoleController from '../userRole/UserRoleController';

class CommentsController {
  static async createComment(req, res) {
    try {
      const { requestId, documentId, comment } = req.body;
      const userIdInteger = await UserRoleController.getRecipient(null, req.user.UserInfo.id);
      const { name, picture, id: senderId } = req.user.UserInfo;
      
      const commentData = {
        ...req.body,
        id: Utils.generateUniqueId(),
        userId: userIdInteger.id
      };

      const userEmails = CommentsController.getEmailsFromComment(commentData.comment) || [];
      const taggedUsers = await CommentsController.getTaggedUsers(userEmails);

      if (taggedUsers.length > 0) {
        const message = `You were mentioned in a comment click here to view 
        <a href=${process.env.REDIRECT_URL}/redirect/requests/${requestId}>${requestId}</a> `;
        NotificationEngine.notifyMany({
          users: taggedUsers, senderId, name, picture, message, id: requestId
        });
        const data = CommentsController.tagNotificationData(name, requestId, picture, comment);
        NotificationEngine.sendMailToMany(taggedUsers, data);
      }
      
      let commentType;
      let request;
      if (requestId) {
        commentType = 'Request';
        request = await models.Request.findById(requestId);
      }
      if (documentId) {
        commentType = 'Document';
        request = await models.TravelReadinessDocuments.findById(documentId);
      }
      return CommentsController.getReferenceIdFromTable(
        request, commentData, req, res, commentType
      );
    } catch (error) { /* istanbul ignore next */
      return Error.handleError('Server Error', 500, res);
    }
  }

  static async getTaggedUsers(userEmails) {
    const taggedUsers = await models.User.findAll({ where: { email: userEmails } }) || [];
    return taggedUsers;
  }

  static tagNotificationData(name, requestId, picture, comment) {
    const data = {
      topic: 'You were mentioned in a comment',
      sender: name,
      type: 'You were mentioned in a comment',
      redirectLink: `${process.env.REDIRECT_URL}/redirect/requests/${requestId}`,
      details: {
        requesterName: name,
        id: requestId
      },
      picture,
      comment,
      id: requestId
    };
    return data;
  }

  static getEmailsFromComment(comment) {
    const regularExpression = /@[\S]*.@andela.com\b/g;
    const matchedStrings = comment.match(regularExpression);
    const uniqueMatches = [...new Set(matchedStrings)];
    return uniqueMatches.map(email => email.slice(1));
  }

  static async getReferenceIdFromTable(request, commentData, req, res, commentType) {
    if (request) {
      const newComment = await models.Comment.create(commentData);
      const commentDetails = { ...newComment };
      await CommentsController.createNotificationByManager(
        req, res, request, commentDetails, commentType
      );
      return res.status(201).json({
        success: true,
        message: 'Comment created successfully',
        comment: newComment,
      });
    }
    return Error.handleError('Request does not exist', 404, res);
  }

  static async createNotificationByManager(req, res, request, comment, commentType) {
    try {
      const { name, picture } = req.user.UserInfo;
      const { id, userId, type: documentType } = request;
      const manager = request.manager || name;
      const requesterDetails = await UserRoleController.getRecipient(null, userId);
      const managerDetail = await UserRoleController.getRecipient(null, null, manager);
      const linkType = commentType === 'Document'
        ? `/travel-readiness/${userId}?id=${id}&type=${documentType}`
        : `/requests/${id}`;
      const newNotificationDetail = {
        senderId: managerDetail.userId,
        recipientId: request.userId,
        notificationType: 'general',
        message: 'posted a comment',
        notificationLink: linkType,
        senderName: name,
        senderImage: picture
      };

      return CommentsController.createRedirectLink(
        req, res, userId, id, requesterDetails, managerDetail, manager,
        request, commentType, name, comment, picture, newNotificationDetail
      );
    } catch (error) { /* istanbul ignore next */ }
  }

  static createRedirectLink(
    req, res, userId, id, requesterDetails, managerDetail, manager,
    request, commentType, name, comment, picture, newNotificationDetail
  ) {
    let redirectLink = `${process.env.REDIRECT_URL}/redirect/requests/${id}`;
    let recipientEmail = requesterDetails.email;
    let recipientName = requesterDetails.fullName;
    let recipientId = userId;
    /* istanbul ignore next */
    if (userId === req.user.UserInfo.id) {
      redirectLink = `${process.env.REDIRECT_URL}/redirect/requests/my-approvals/${id}`;
      recipientEmail = managerDetail.email;
      recipientName = manager;
      recipientId = managerDetail.userId;
    }
    if (commentType === 'Document') {
      const { type: documentType } = request;
      redirectLink = `${process.env.REDIRECT_URL}/redirect/travel-readiness/${userId}?id=${id}&type=${documentType}`;
    }
    /* istanbul ignore next */
    CommentsController.sendEmail(
      req.user.UserInfo.id, recipientEmail, recipientName,
      name, redirectLink, id, recipientId, comment, picture, commentType
    );
    /* istanbul ignore next */
    if (managerDetail.userId === req.user.UserInfo.id) {
      return NotificationEngine.notify(newNotificationDetail);
    }
  }

  static sendEmail(
    senderId, recipientEmail, recipientName, name, redirectLink,
    id, recipientId, comment, picture, commentType
  ) {
    return NotificationEngine.sendMail({
      recipient: {
        email: recipientEmail,
        name: recipientName
      },
      sender: name,
      topic: `Travel Comment Notification (#${id}#${senderId}#${recipientId}#)`,
      type: commentType,
      redirectLink,
      requestId: id,
      comment,
      picture
    });
  }


  static async editComment(req, res) {
    try {
      const userIdInteger = await UserRoleController.getRecipient(null, req.user.UserInfo.id);
      const { requestId } = req.body;
      const commentId = req.params.id;
      const commentData = {
        ...req.body, userId: userIdInteger.id, isEdited: true, documentId: null
      };
      const request = await models.Request.findById(requestId)
      || await models.TravelReadinessDocuments.findById(requestId);
      if (!request) {
        return Error.handleError('Request does not exist', 404, res);
      }
      const foundComment = await models.Comment.findById(commentId);
      if (!foundComment) {
        return Error.handleError('Comment does not exist', 404, res);
      }
      if (foundComment.documentId) {
        commentData.requestId = null;
        commentData.documentId = requestId;
      }
      const editedComment = await models.Comment.update(commentData,
        { where: { id: commentId }, returning: true, plain: true });
      return res.status(200).json({
        success: true,
        message: 'Comment updated successfully',
        comment: editedComment[1],
      });
    } catch (error) { /* istanbul ignore next */
      return Error.handleError('Server Error', 500, res);
    }
  }

  static async deleteComment(req, res) {
    try {
      const commentId = req.params.id;
      const foundComment = await models.Comment.findById(commentId);
      if (!foundComment) {
        return res.status(404).json({
          success: false,
          error: 'Comment does not exist',
        });
      }
      const userIdInteger = await UserRoleController.getRecipient(null, req.user.UserInfo.id);
      const isAllowed = userIdInteger.id === foundComment.userId;
      if (isAllowed) {
        await foundComment.destroy();
        return res.status(200).json({
          success: true,
          message: 'Comment deleted successfully',
        });
      }
      return res.status(401).json({
        success: false,
        message: 'You are not allowed to delete this comment',
      });
    } catch (error) { /* istanbul ignore next */
      return Error.handleError('Server Error', 500, res);
    }
  }
}

export default CommentsController;
