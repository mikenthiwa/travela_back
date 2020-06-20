import models from '../database/models';

const fetchOneHotelEstimate = async (id) => {
  const hotelEstimate = await models.HotelEstimate.findById(id, {
    include: [
      {
        model: models.User,
        as: 'creator',
        attributes: ['id', 'fullName']
      }
    ]
  });
  return hotelEstimate;
};

export default fetchOneHotelEstimate;
