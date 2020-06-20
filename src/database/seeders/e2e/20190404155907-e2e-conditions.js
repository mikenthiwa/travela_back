module.exports = {
  up: queryInterface => queryInterface.bulkInsert(
    'Conditions',
    [
      {
        id: '1',
        conditionName: 'Passport Renewal',
        documentType: 'Passport',
        userId: '-LSsFyueC086niFc9rrz',
        createdAt: '2019-03-29 18:42:51.078+03',
        updatedAt: '2019-03-29 18:42:51.078+03',
        disabled: false
      },
      {
        id: '2',
        conditionName: 'Passport Invalid',
        documentType: 'Passport',
        userId: '-LSsFyueC086niFc9rrz',
        createdAt: '2019-03-29 18:49:51.56+03',
        updatedAt: '2019-03-29 18:49:51.56+03',
        disabled: false
      }
    ],
    {}
  ),

  down: queryInterface => queryInterface.bulkDelete('Conditions', null, {})
};
