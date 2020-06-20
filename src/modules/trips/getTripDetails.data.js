const getTripDetails = (userId, models) => models.Trip.findAll({
  include: [{
    required: true,
    model: models.Request,
    as: 'request',
    where: {
      status: 'Verified',
      userId
    },
  }, {
    required: true,
    model: models.Bed,
    as: 'beds',
    include: [{
      required: true,
      model: models.Room,
      as: 'rooms',
      include: [{
        required: true,
        model: models.GuestHouse,
        as: 'guestHouses',
      }]
    }]
  }, {
    model: models.TravelReason,
    as: 'reasons',
  }],
  orderBy: ['id', 'ASC']
});

export default getTripDetails;
