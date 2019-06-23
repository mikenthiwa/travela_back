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

export const notifyTravelAdmins = async ({
  requestId,
  requesterId,
  requesterName,
  requestDetails,
  picture, allLocations
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

    if (localAdmins) {
      NotificationEngine.notify({
        ...notificationData,
        recipientId: localAdmins.userId,
        notificationLink: `/requests/modifications/${requestId}`,
        message: `This is to inform you that ${requesterName}, has just modified the dates on their ${requestDetails.dataValues.tripType} trip ${requestId} to ${location[1]}.`
      });
    }
    if (destinationAdmins) {
      NotificationEngine.notify({
        ...notificationData,
        recipientId: destinationAdmins.userId,
        notificationLink: `/requests/my-verifications/${requestId}`,
        message: `This is to inform you that ${requesterName}, has just modified the dates requested on their ${requestDetails.dataValues.tripType} trip ${requestId} to your centre.`
      });
    }
  });
};

export const mailTravelAdmins = async ({
  requestId, requesterName, allLocations, requestDetails
}) => {
  allLocations.map(async (location) => {
    const localAdmins = await retrieveTravelAdminDetails(location[0]);
    const destinationAdmins = await retrieveTravelAdminDetails(location[1]);

    const data = {
      sender: requesterName,
      topic: 'Trip Modification Request',
      details: {
        requesterName,
        requestId,
        destination: location[1],
        tripType: requestDetails.dataValues.tripType
      },
      redirectLink: `${process.env.REDIRECT_URL}/redirect/requests/modifications/${requestId}`
    };

    if (localAdmins) {
      NotificationEngine.sendMailToMany([localAdmins],
        {
          ...data,
          type: 'Notify Travel Administrator of Trip Modification Origin',
          redirectLink: `${process.env.REDIRECT_URL}/redirect/requests/modifications/${requestId}`
        });
    }
    if (destinationAdmins) {
      NotificationEngine.sendMailToMany([destinationAdmins],
        {
          ...data,
          type: 'Notify Travel Administrator of Trip Modification Destination',
          redirectLink: `${process.env.REDIRECT_URL}/redirect/requests/my-verifications/${requestId}`
        });
    }
  });
};

export const notifyAndMailAdminsForTripModification = async (notificationData) => {
  const { allLocations } = await retrieveLocations(notificationData.requestId);
  const requestDetails = await models.Request.findByPk(notificationData.requestId);

  await notifyTravelAdmins({ ...notificationData, requestDetails, allLocations, });
  await mailTravelAdmins({ ...notificationData, requestDetails, allLocations });
};
