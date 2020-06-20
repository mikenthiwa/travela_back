module.exports = {
  up: queryInterface => queryInterface.bulkInsert('TravelReadinessDocuments', [
    {
      id: 'pk42DLnx4C',
      type: 'passport',
      data: JSON.stringify({
        passportNumber: 'qw357etrty',
        nationality: 'kenyan',
        dateOfBirth: '1970-01-01',
        dateOfIssue: '2018-11-01',
        placeOfIssue: 'Kenya',
        expiryDate: '2029-11-01',
        cloudinaryUrl: 'https://res.cloudinary.com/dbk8ky2'
      }),
      userId: '-LSsFyueC086niFc9rrz',
      createdAt: '2019-01-04 012:11:52.181+01',
      updatedAt: '2019-01-16 012:11:52.181+01',
    },
    {
      id: 'vbhg4567h',
      type: 'passport',
      data: JSON.stringify({
        passportNumber: 'qw357etrty',
        nationality: 'kenyan',
        dateOfBirth: '1970-01-01',
        dateOfIssue: '2018-11-01',
        placeOfIssue: 'Kenya',
        expiryDate: '2029-11-01',
        cloudinaryUrl: 'https://res.cloudinary.com/dbk8ky2'
      }),
      userId: '-LMfhfu756fhvgf764',
      createdAt: '2019-01-04 012:11:52.181+01',
      updatedAt: '2019-01-16 012:11:52.181+01',
    },
  ]),

  down: queryInterface => queryInterface.bulkDelete('TravelReadinessDocuments')
};
