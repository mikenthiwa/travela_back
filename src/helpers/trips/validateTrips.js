import models from '../../database/models';

const { Op } = models.Sequelize;
const options = searchTrips => ({
  where: {
    [Op.or]: searchTrips
  },
  include: [{
    model: models.Request,
    as: 'request'
  }]
});

export default options;
