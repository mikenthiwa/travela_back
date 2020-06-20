
module.exports = {
  up: queryInterface => queryInterface.bulkInsert(
    'ChecklistSubmissions',
    [
      {
        id: 'gavjL5B-G',
        value: '{"departureTime":"2020-06-06T01:00","arrivalTime":"2020-06-06T12:00","airline":"Kenya airways","ticketNumber":"KQ 5678","returnDepartureTime":"","returnTime":"","returnTicketNumber":"","returnAirline":""}',
        tripId: 1,
        checklistItemId: 1,
        createdAt: '2019-03-08 14:56:49.559+03',
        updatedAt: '2019-03-08 14:56:50.082+03',
        deletedAt: null
      }
    ],
    {},
  ),

  down: queryInterface => queryInterface.bulkDelete('ChecklistSubmissions', null, {})
};
