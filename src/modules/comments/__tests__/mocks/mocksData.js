const mockData = {
  userMock: {
    id: 10,
    fullName: 'Samuel Kubai',
    email: 'captan.ameria@andela.com',
    userId: '-MUyHJmKrxA90lPNQ1FOLNm',
    location: 'Lagos',
  },
  otherUserMock: {
    fullName: 'David Muhanguzi',
    email: 'captan2.ameria@andela.com',
    userId: '-MUnaemKrxA90lPNQ1FOLNm',
    location: 'Lagos',
  },
  requestsMock: [
    {
      id: '-ss60B42oZ-a',
      name: 'Ademola Ariya',
      manager: 'Samuel Kubai',
      gender: 'Male',
      department: 'TDD',
      status: 'Open',
      role: 'Software Developer',
      userId: '-LHJmKrxA8SlPNQFOVVm',
      picture: 'fakepicture.png',
      createdAt: '2018-08-16 012:11:52.181+01',
      updatedAt: '2018-08-16 012:11:52.181+01',
      tripType: 'oneWay'
    },
    {
      id: '-ss60B42oZ-b',
      name: 'Ademola Ariya',
      manager: 'Samuel Kubai',
      tripType: 'return',
      gender: 'Male',
      department: 'TDD',
      status: 'Open',
      role: 'Software Developer',
      userId: '-LHJmKrxA8SlPNQFOVVm',
      picture: 'fakepicture.png',
      createdAt: '2018-08-16 012:11:52.181+01',
      updatedAt: '2018-08-16 012:11:52.181+01',
    },
    {
      id: '-ss60B42oZ-c',
      name: 'Ademola Ariya',
      tripType: 'oneWay',
      manager: 'Samuel Kubai',
      gender: 'Male',
      department: 'TDD',
      status: 'Open',
      role: 'Software Developer',
      userId: '-LHJmKrxA8SlPNQFOVVm',
      picture: 'fakepicture.png',
      createdAt: '2018-08-16 012:11:52.181+01',
      updatedAt: '2018-08-16 012:11:52.181+01',
    },
  ],
  documentMock: {
    id: 'ss60B42oZd',
    type: 'visa',
    data: {
      country: 'Kenya',
      visaType: 'Business',
      entryType: 'Multiple',
      expiryDate: '03/01/2018',
      dateOfIssue: '02/01/2018',
      cloudinaryUrl: 'https://res.cloudinary.com/ined/image/upload/v1538568663/Logo_blue_2x.png'
    },
    isVerified: 'FALSE',
    userId: '-MUyHJmKrxA90lPNQ1FOLNm',
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01',
  },
  commentMock: {
    id: 'DOCstrange',
    comment: "I thought we agreed you'd spend only two weeks",
    isEdited: false,
    requestId: '-ss60B42oZ-a',
    userName: 'Doctor Strange',
    userEmail: 'doctor.strange@andela.com',
    picture: 'fakepicture.png',
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01',
    documentId: null,
    userId: 10,
  },
  commentMockDocument: {
    id: 'DOCstrangeDoc',
    comment: "I thought we agreed you'd spend only two weeks doc",
    isEdited: false,
    requestId: null,
    userName: 'Doctor Strange',
    userEmail: 'doctor.strange@andela.com',
    picture: 'fakepicture.png',
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01',
    documentId: 'ss60B42oZd',
    userId: 10,
  },
  documentTypes: [{
    name: 'passport',
    createdAt: new Date(),
    updatedAt: new Date(),
  }, {
    name: 'visa',
    createdAt: new Date(),
    updatedAt: new Date(),
  }, {
    name: 'yellow fever document',
    createdAt: new Date(),
    updatedAt: new Date(),
  }],
};

export default mockData;
