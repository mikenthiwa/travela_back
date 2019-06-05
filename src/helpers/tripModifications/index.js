import { Op } from 'sequelize';
import _ from 'lodash';
import models from '../../database/models';
import Pagination from '../Pagination';
import { createSearchClause, getModelSearchColumns } from '../requests';
import NotificationEngine from '../../modules/notifications/NotificationEngine';

const createSearchQuery = (searchRequest, search, status) => {
  const requestWhere = {};
  const tripsWhere = {};
  if (searchRequest) {
    requestWhere[Op.or] = createSearchClause(
      getModelSearchColumns('Request'), search, 'Request'
    );
  } else {
    tripsWhere[Op.or] = createSearchClause(
      getModelSearchColumns('Trip'), search
    );
  }

  if (/past/i.test(status)) {
    requestWhere.tripModificationId = {
      [Op.eq]: null
    };
  }
  return { requestWhere, tripsWhere };
};

const createModificationQuery = (status, type) => {
  const where = {};
  const currentWhere = {};
  let required = false;

  if (status && /^(open|approved|rejected|past)$/i.test(status)) {
    where.status = /past/i.test(status) ? ['Approved', 'Rejected'] : _.capitalize(status);
    required = !(/past/i.test(status));
  }
  if (type) {
    where.type = type;
    currentWhere.type = type;
  }

  return { where, currentWhere, required };
};

const createQuery = (status = 'Open', type = '', req, searchRequest = true) => {
  const { limit, offset } = Pagination.initializePagination(req);
  const { query: { search = '' } } = req;
  const { where, currentWhere, required } = createModificationQuery(status, type);
  const { requestWhere, tripsWhere } = createSearchQuery(searchRequest, search, status);

  return {
    distinct: true,
    where: requestWhere,
    limit,
    offset,
    openModificationsCount: [],
    include: [
      {
        model: models.TripModification,
        as: 'currentModification',
        required,
        where: currentWhere
      },
      {
        model: models.TripModification,
        as: 'modifications',
        required: true,
        where
      }, {
        model: models.Trip,
        as: 'trips',
        where: tripsWhere
      }
    ],
    order: [
      [{ model: models.TripModification, as: 'modifications' }, 'id', 'DESC']
    ]
  };
};

export const fetchModifications = async (req) => {
  const { query: { status, type } } = req;
  let modifications = await models.Request.findAndCountAll(createQuery(status, type, req));
  if (!modifications.count) {
    modifications = models.Request.findAndCountAll(createQuery(status, type, req, false));
  }
  return modifications;
};


export const countModifications = async (req) => {
  const count = {};
  count.cancelled = await models.Request.count(
    createQuery('Open', 'Cancel Trip', req)
  );
  count.modified = await models.Request.count(
    createQuery('Open', 'Modify Dates', req)
  );

  count.cancelled = count.cancelled || await models.Request.count(
    createQuery('Open', 'Cancel Trip', req, false)
  );
  count.modified = count.modified || await models.Request.count(
    createQuery('Open', 'Modify Dates', req, false)
  );
  return count;
};

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
  tripModificationReason,
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
        message: `This is to inform you that ${requesterName}, has just requested you to allow them to modify their ${requestDetails.dataValues.tripType} trip ${requestId} to ${location[1]} because ${tripModificationReason}.`
      });
    }
    if (destinationAdmins) {
      NotificationEngine.notify({
        ...notificationData,
        recipientId: destinationAdmins.userId,
        notificationLink: `/requests/my-verifications/${requestId}`,
        message: `This is to inform you that ${requesterName}, has just requested their local travel team to allow them to modify their ${requestDetails.dataValues.tripType} trip ${requestId} to your centre because ${tripModificationReason}.`
      });
    }
  });
};

export const mailTravelAdmins = async ({
  requestId, requesterName, tripModificationReason, allLocations, requestDetails
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
        tripModificationReason,
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
