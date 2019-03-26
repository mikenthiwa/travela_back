module.exports = {
  up: queryInterface => queryInterface.bulkInsert(
    'Trips',
    [
      {
        id: '12315',
        origin: 'Nairobi, Kenya',
        destination: 'Lagos, Nigeria',
        checkStatus: 'Not Checked In',
        checkInDate: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`,
        checkOutDate: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate() + 5}`,
        accommodationType: 'Residence',
        bedId: '12314',
        returnDate: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate() + 5}`,
        departureDate: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`,
        requestId: '34510',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    {},
  ),

  down: queryInterface => queryInterface.bulkDelete('Trips', null, {}),
};
