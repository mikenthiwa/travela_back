
const getRequests = (requestId, models) => models.Request.find({
  where: { id: requestId },
  include: [
    {
      model: models.TripModification,
      as: 'modifications',
      required: false,
    },
    {
      model: models.TripModification,
      as: 'currentModification',
      required: false
    },
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
    }, {
      model: models.DynamicChecklistSubmissions,
      as: 'dynamicChecklistSubmission',
      attributes: ['completionCount', 'isSubmitted'],
      where: undefined,
    }],
  order: [
    [{ model: models.Trip, as: 'trips' }, 'returnDate', 'ASC'],
    [{ model: models.TripModification, as: 'modifications' }, 'id', 'DESC']
  ]
});

export default getRequests;
