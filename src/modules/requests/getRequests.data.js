
const getRequests = (requestId, models) => models.Request.find({
  where: { id: requestId },
  include: [
    {
      model: models.Comment,
      as: 'comments',
      include: [{
        model: models.User,
        as: 'user',
      }]
    }, {
      model: models.Trip,
      as: 'trips',
      include: [
        {
          model: models.TravelReason,
          paranoid: false,
          as: 'reasons',
        },
        {
          model: models.Bed,
          as: 'beds',
          include: [{
            model: models.Room,
            as: 'rooms',
            include: [{
              model: models.GuestHouse,
              as: 'guestHouses'
            }]
          }]
        }]
    }]
});

export default getRequests;
