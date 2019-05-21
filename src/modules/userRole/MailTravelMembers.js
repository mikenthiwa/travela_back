import dotenv from 'dotenv';
import cron from 'node-cron';
import { log as logger } from 'debug';
import models from '../../database/models';
import NotificationEngine from '../notifications/NotificationEngine';
import TravelChecklistController from '../travelChecklist/TravelChecklistController';
import UserRoleController from './UserRoleController';
import env from '../../config/environment';

dotenv.config();

class MailTravelMembers {
  static async sendTravelTeamEmails(requester, trips) {
    try {
      const travelTeamMembers = await UserRoleController.calculateUserRole('339458');
      const { users } = travelTeamMembers.dataValues;

      trips.filter(async (trip) => {
        const { destination, origin } = trip;

        users.map(async (travelTeamMember) => {
          if (travelTeamMember.centers.length === 0) {
            logger(`${travelTeamMember.fullName} has no set centers. This needs to be corrected!`);
            return;
          }

          const { location } = travelTeamMember.centers[0];
          const { fullName, email } = travelTeamMember;
          const recipient = {
            fullName,
            email
          };

          if (trip.travelCompletion !== 'true') {
            if (location === origin || location === destination) {
              await MailTravelMembers.sendNotificationToTeamMember(
                recipient,
                'Travel readiness completion',
                'Travel Readiness',
                requester,
                destination,
              );
              await trip.update({
                travelCompletion: 'true'
              });
            }
          }
        });
      });
    } catch (error) {
      /* istanbul ignore next */
      return error;
    }
  }

  static async sendNotificationToTeamMember(
    recipient,
    topic,
    type,
    requester,
    destination,
  ) {
    const mailBody = {
      recipient: { name: recipient.fullName, email: recipient.email },
      sender: ['Travela', requester, destination],
      redirectLink: `${env.REDIRECT_URL}/redirect/dashboard#travel-readiness`,
      topic,
      type,
    };
    return NotificationEngine.sendMail(mailBody);
  }

  static async executeMailSend(req, res) {
    const allRequest = await models.Request.findAll({
      include: [{
        model: models.Trip,
        as: `${models.Trip.name.toLowerCase()}s`,
      }]
    });

    await Promise.all(allRequest.map(async (request) => {
      // checklistPercentageNumber needs a query object in req or it will always fail
      req.query = {};

      const travelCompletion = await TravelChecklistController
        .checkListPercentageNumber(req, res, request.id);
      request.dataValues.travelCompletion = travelCompletion;
      const { trips, name } = request.dataValues;
      if (travelCompletion === 100) {
        await MailTravelMembers
          .sendTravelTeamEmails(name, trips);
      }
      return request;
    }));
  }

  /* istanbul ignore next */
  static sendMail() {
    const { TRAVEL_READINESS_MAIL_CYCLE, NODE_ENV } = env;

    /* istanbul ignore next */
    if (NODE_ENV !== 'test') {
      const req = {};
      const res = {};

      // If the TRAVEL_READINESS_MAIL_CYCLE is not given, resort to using 2 hours
      let cycle = '* * 2 * * *';

      if (TRAVEL_READINESS_MAIL_CYCLE && cron.validate(TRAVEL_READINESS_MAIL_CYCLE)) {
        cycle = TRAVEL_READINESS_MAIL_CYCLE;
      }
      cron.schedule(cycle, async () => {
        await MailTravelMembers.executeMailSend(req, res);
      }, { scheduled: true });
    }
  }
}

export default MailTravelMembers;
