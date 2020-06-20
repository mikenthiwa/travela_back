import models from '../../database/models';
import NotificationEngine from '../../modules/notifications/NotificationEngine';

export const retrieveLocations = async (requestId) => {
  const trips = await models.Trip.findAll({ where: { requestId } });
  const allLocations = [];
  const locations = trips.reduce((tripLocations, trip) => {
    allLocations.push([trip.origin.split(', ')[1], trip.destination.split(', ')[1]]);
    tripLocations.push(trip.origin, trip.destination);
    return tripLocations;
  }, []).map(location => location.split(', ')[1]);

  return { locations, allLocations };
};

export const retrieveTravelAdminDetails = async (location) => {
  const center = await models.Center.findOne({ where: { location } });

  const locationAdmin = await models.UserRole.findAll({
    where: {
      centerId: center.id,
      roleId: 29187
    },
    include: [{ model: models.User, as: 'user' }]
  });

  return {
    fullName: locationAdmin[0].dataValues.user.fullName,
    userId: locationAdmin[0].dataValues.user.userId,
    email: locationAdmin[0].dataValues.user.email
  };
};


const sendNotification = (notificationData, requestId, admins, message, destination = false) => {
  NotificationEngine.notify({
    ...notificationData,
    recipientId: admins.userId,
    notificationLink: `/requests/my-verifications/${requestId}`,
    message: message(destination)
  });
};

export const notifyTravelAdmins = async ({
  requestId,
  requesterId,
  requesterName,
  requestDetails,
  picture,
  allLocations,
  type
}) => {
  allLocations.map(async (location) => {
    const localAdmins = await retrieveTravelAdminDetails(location[0]);
    const destinationAdmins = await retrieveTravelAdminDetails(location[1]);

    const notificationData = {
      senderId: requesterId,
      senderName: requesterName,
      senderImage: picture,
      notificationType: 'general',
      requestId,
    };

    const message = (destination = false) => ({
      'Modify Dates': `This is to inform you that ${requesterName}, has just modified the dates on their ${requestDetails.dataValues.tripType} trip ${requestId} to ${destination ? 'your center.' : location[1]}.`,
      'Cancel Trip': `This is to inform you that ${requesterName}, has just cancelled their ${requestDetails.dataValues.tripType} trip ${requestId} to ${destination ? 'your center.' : location[1]}`
    }[type]);

    [localAdmins, destinationAdmins].forEach((admins) => {
      if (admins) {
        sendNotification(
          notificationData, requestId, admins, message,
          admins === destinationAdmins
        );
      }
    });
  });
};

const sendMail = (admins, data, types, requestId, destination = false) => {
  NotificationEngine.sendMailToMany([admins],
    {
      ...data,
      type: types(destination),
      redirectLink: `${process.env.REDIRECT_URL}/redirect/requests/modifications/${requestId}`
    });
};

export const mailTravelAdmins = async ({
  requestId, requesterName, allLocations, requestDetails, type
}) => {
  allLocations.map(async (location) => {
    const localAdmins = await retrieveTravelAdminDetails(location[0]);
    const destinationAdmins = await retrieveTravelAdminDetails(location[1]);

    const topics = {
      'Modify Dates': 'Trip Modification',
      'Cancel Trip': 'Trip Cancellation'
    };

    const types = destination => ({
      'Modify Dates': `Notify Travel Administrator of Trip Modification ${destination ? 'Destination' : 'Origin'}`,
      'Cancel Trip': `Notify Travel Administrator of Trip Cancellation ${destination ? 'Destination' : 'Origin'}`
    }[type]);

    const data = {
      sender: requesterName,
      topic: topics[type],
      details: {
        requesterName,
        requestId,
        destination: location[1],
        tripType: requestDetails.dataValues.tripType
      },
      redirectLink: `${process.env.REDIRECT_URL}/redirect/requests/modifications/${requestId}`
    };

    [localAdmins, destinationAdmins]
      .forEach((admins) => {
        if (admins) {
          sendMail(admins, data, types, requestId, admins === destinationAdmins);
        }
      });
  });
};

export const notifyAndMailAdminsForTripModification = async (
  notificationData, type = 'Modify Dates') => {
  const { allLocations } = await retrieveLocations(notificationData.requestId);
  const requestDetails = await models.Request.findByPk(notificationData.requestId);

  await notifyTravelAdmins({
    ...notificationData, requestDetails, allLocations, type
  });
  await mailTravelAdmins({
    ...notificationData, requestDetails, allLocations, type
  });
};
