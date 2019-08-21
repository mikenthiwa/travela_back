module.exports = {
  up: queryInterface => queryInterface.bulkInsert('DocumentTypes',
    [{
      name: 'passport',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      name: 'visa',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      name: 'other',
      createdAt: new Date(),
      updatedAt: new Date(),
    }], {}),

  down: queryInterface => queryInterface.bulkDelete('DocumentTypes', null, {}),
};
