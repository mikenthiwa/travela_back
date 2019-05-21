import moment from 'moment';
import models from '../../database/models';
import UserRoleController from '../userRole/UserRoleController';


class TripUtils {
  static async fetchTripsOriginAndDestination(tripId) {
    const tripsOriginAndDestination = await models.Trip.findOne({
      where: {
        id: tripId,
      },
      attributes: ['origin', 'destination', 'returnDate', 'checkInDate', 'checkOutDate'],
      include: [{
        as: 'beds',
        model: models.Bed,
        include: [{
          as: 'rooms',
          model: models.Room,
          include: [{
            as: 'guestHouses',
            model: models.GuestHouse,
            attributes: ['id', 'houseName'],
          }]
        }]
      }],
    });
    return tripsOriginAndDestination;
  }


  static getMailData(request, user, topic, type, travelAdmin) {
    const mailBody = {
      recipient: { name: user.fullName, email: user.email },
      sender: travelAdmin.name,
      topic,
      type,
      requestId: request.id,
      redirectLink:
        `${process.env.REDIRECT_URL}/redirect/requests/${request.id}`
    };
    return mailBody;
  }

  static async getOriginDestinationAdmin({ origin, destination }) {
    const travelAdminRoleId = 29187;
    const travelAdmins = await UserRoleController.calculateUserRole(travelAdminRoleId);
    const centersTravelAdmin = travelAdmins.users.filter(
      user => user.centers[0].dataValues === origin || destination
    )
      .map(user => user.dataValues);
    return centersTravelAdmin;
  }

  static async getCheckInCheckOutMailData(
    {
      tripId, sender, topic, type
    }
  ) {
    const redirect = '/redirect/residence/manage/guest-houses/';
    const guestHouseDetails = await TripUtils.fetchTripsOriginAndDestination(tripId);

    const guestHouse = guestHouseDetails.beds.rooms.guestHouses;
    // Calculate duration of stay
    const checkIn = moment(guestHouseDetails.checkInDate);
    const checkOut = moment(guestHouseDetails.returnDate);
    const days = checkOut.diff(checkIn, 'days') + 1;

    const mailContent = {
      sender,
      topic,
      type,
      redirectLink: `${process.env.REDIRECT_URL}${redirect}${guestHouse.id}`,
      guesthouseName: guestHouse.houseName,
      checkInTime: moment(guestHouseDetails.checkInDate).format('hh:mm:ss a'),
      checkoutTime: moment(Date.now()).format('hh:mm:ss a'),
      durationOfStay: days,
    };
    return mailContent;
  }

  static async getMailDataWithReceipints(trip, type, topic) {
    const {
      origin,
      destination,
      requestId,
      id
    } = trip.dataValues;
    const request = await models.Request.findById(requestId);
    const user = await models.User.findOne({
      where: { userId: request.userId }
    });
    const { fullName } = user.dataValues;
    const data = await TripUtils.getCheckInCheckOutMailData({
      tripId: id, user, sender: fullName, topic, type,
    });
    const travelAdmins = await TripUtils
      .getOriginDestinationAdmin({ origin, destination });
    return { data, travelAdmins };
  }
}

export default TripUtils;
