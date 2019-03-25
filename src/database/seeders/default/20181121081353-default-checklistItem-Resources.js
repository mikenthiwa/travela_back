module.exports = {
  up: queryInterface => queryInterface.bulkInsert('ChecklistItemResources',
    [
      {
        id: '1',
        link: 'https://docs.google.com/document/d/17vOCjPE3sgG2OSYV_3ZcpzCg1IbD7dCO8cVa8aBDN_M/edit?usp=drivesdk',
        label: 'Flight Application Guide',
        checklistItemId: '2',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {}),

  down: queryInterface => queryInterface.bulkDelete('ChecklistItemResources', null, {})
};
