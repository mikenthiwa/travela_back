module.exports = {
  up: queryInterface => queryInterface.bulkInsert('TravelReadinessDocuments', [
    {
      id: 'SyOyr_AtC',
      type: 'visa',
      data: JSON.stringify({
        entryType: 'Business',
        country: 'Kenya',
        dateOfIssue: '02-01-2018',
        expiryDate: '06-01-2018',
        cloudinaryUrl: 'https://res.cloudinary.com/ined/image/upload/v1538568663/Logo_blue_2x.png'
      }),
      userId: '-LJlsimdclse9s',
      createdAt: '2019-01-04 012:11:52.181+01',
      updatedAt: '2019-01-16 012:11:52.181+01',
    },
    {
      id: 'b9gnYkdzG',
      type: 'visa',
      data: JSON.stringify({
        entryType: 'Business',
        country: 'Kenya',
        dateOfIssue: '02-01-2018',
        expiryDate: '06-01-2018',
        cloudinaryUrl: 'https://res.cloudinary.com/ined/image/upload/v1538568663/Logo_blue_2x.png'
      }),
      userId: '-LJlsimdclse9s',
      createdAt: '2019-01-04 012:11:52.181+01',
      updatedAt: '2019-01-16 012:11:52.181+01',
    },
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
      userId: '-LJlsimdclse9s',
      createdAt: '2019-01-04 012:11:52.181+01',
      updatedAt: '2019-01-16 012:11:52.181+01',
    },
  ]),

  down: queryInterface => queryInterface.bulkDelete('TravelReadinessDocuments')
};
