import { Op } from 'sequelize';
import NotificationEngine from '../notifications/NotificationEngine';
import UserRoleController from '../userRole/UserRoleController';
import Validator from '../../middlewares/Validator';
import models from '../../database/models';

class TravelReadinessUtils {
  static getMailData(details, user, topic, type, travelAdmin) {
    const mailBody = {
      recipient: { name: user.fullName, email: user.email, details },
      sender: travelAdmin.UserInfo.name,
      topic,
      type,
      details,
      requestId: details.id,
      redirectLink: `${process.env.REDIRECT_URL}/travel_readiness?id=${
        details.id
      }&type=${details.type}`
    };
    return mailBody;
  }

  static async sendMailToTravelTeamMembers(documentDeleter, deleterEmail) {
    const query = {
      where: {
        email: deleterEmail
      }
    };
    const { location: userLocation } = await Validator.getUserFromDb(query);
    const { users: travelMembers } = await UserRoleController.calculateUserRole('339458');
    const travelTeamMembers = await TravelReadinessUtils
      .getRoleMembers(travelMembers, userLocation);
    const data = {
      sender: documentDeleter,
      topic: 'Deletion of travel document',
      type: 'Send delete email verification'
    };
    if (travelTeamMembers.length) {
      return NotificationEngine.sendMailToMany(
        travelTeamMembers,
        data
      );
    }
  }

  static async getRoleMembers(roleMembers, userLocation) {
    const availableRoleMemberIds = roleMembers.map(member => member.id);
    const availableRoleMembers = await models.User.findAll({
      where: {
        id: availableRoleMemberIds,
        location: {
          [Op.in]: userLocation instanceof Array ? userLocation : [userLocation]
        }
      },
      attributes: ['fullName', 'email'],
      raw: true
    });
    return availableRoleMembers;
  }
}

export default TravelReadinessUtils;
