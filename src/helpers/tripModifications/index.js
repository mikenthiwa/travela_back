import { Op } from 'sequelize';
import _ from 'lodash';
import models from '../../database/models';
import Pagination from '../Pagination';
import { createSearchClause, getModelSearchColumns } from '../requests';

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
