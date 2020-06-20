import Sequelize from 'sequelize';

const { Op } = Sequelize;

const getSearchQuery = (query) => {
  const searchQuery = {
    [Op.and]: {
      country: {
        [Op.iLike]: `${query}%`
      }
    }
  };
  return searchQuery;
};
export default getSearchQuery;
