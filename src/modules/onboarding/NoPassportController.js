import models from '../../database/models';
import NotificationEngine from '../notifications/NotificationEngine';
import UserHelper from '../../helpers/user';
import Error from '../../helpers/Error';

const { Op } = models.Sequelize;

class NoPassportController {
  static async sendNotificationToTravelAdmin(
    req, res
  ) {
    const data = {
      topic: 'No Passport',
      type: 'NO_PASSPORT',
      details: {
        requesterName: req.user.UserInfo.name
      },
      redirectLink: `${process.env.REDIRECT_URL}/redirect/dashboard`,
    };

    const centerId = UserHelper.getCenterId(req.user.UserInfo.location);
    
    try {
      const travelAdmin = await models.UserRole.findAll({ raw: true, where: { roleId: { [Op.in]: [29187, 339458] }, centerId }, include: [{ model: models.User, as: 'user' }] });
      
      const teamArray = [];
      travelAdmin.map((member) => {
        const teamObject = {
          fullName: member['user.fullName'],
          email: member['user.email']
        };
        teamArray.push(teamObject);
        return teamArray.filter((member1, member2) => teamArray.indexOf(member1) === member2);
      });
      if (teamArray.length) {
        const notificationData = travelTeam => ({
          senderId: req.user.UserInfo.id,
          senderName: req.user.UserInfo.name,
          senderImage: req.user.UserInfo.picture,
          recipientId: travelTeam['user.userId'],
          notificationType: 'general',
          notificationStatus: 'unread',
          notificationLink: '/#',
          message: `This is to inform you that ${req.user.UserInfo.name} does not have a valid passport at time of onboarding`,
            
        });

        travelAdmin.forEach(admin => NotificationEngine.notify(notificationData(admin)));
        NotificationEngine.sendMailToMany(teamArray, data);
        return res.status(200).json({
          success: true,
          message: 'Notification sent successfully',
        });
      }
      return res.status(404).json({
        success: false,
        message: 'Your request could not be processed at this time. Check back later'
      });
    } catch (error) {
      /* istanbul ignore next */
      return Error.handleError(error, 500, res);
    }
  }
}

export default NoPassportController;
