module.exports = {
  up: queryInterface => queryInterface.bulkInsert('Trips',
    [
      {
        id: 'wbYixF-791',
        origin: 'Lagos, Nigeria',
        destination: 'Nairobi, Kenya',
        departureDate: '2019-01-01',
        returnDate: '2019-01-05',
        checkStatus: 'Checked In',
        checkInDate: '2019-01-05',
        checkOutDate: null,
        lastNotifyDate: null,
        notificationCount: 0,
        travelCompletion: 'false',
        createdAt: '2018-12-10T14:21:31.798Z',
        updatedAt: '2018-12-10T14:21:31.798Z',
        deletedAt: null,
        bedId: 2,
        requestId: '34511',
        accommodationType: 'Residence',
        travelReasons: null,
        otherTravelReasons: null
      }
    ], {}),

  down: queryInterface => queryInterface.bulkDelete('Trips', null, {})
};
