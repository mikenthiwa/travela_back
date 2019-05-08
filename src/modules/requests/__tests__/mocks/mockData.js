const date = new Date();
const departureDate = new Date(date.setDate(date.getDate() + 1)).toISOString().split('T')[0];
const returnDate = new Date(date.setDate(date.getDate() + 3)).toISOString().split('T')[0];

export const dates = {
  departureDate,
  returnDate
};

const mockCenter = {
  id: 1,
  location: 'Wakanda'
};

const mockUser = {
  fullName: 'Test User 1',
  passportName: 'Test User 1',
  department: 'Talent & Development',
  occupation: 'Software developer',
  email: 'test.user1@gmail.com',
  userId: 'test-user-1',
  picture: 'picture.png',
  location: 'National City, Wakanda',
  manager: 'Manager',
  gender: 'Male',
  roleId: 401938,
  id: 1
};

const mockTrip = {
  id: 1,
  origin: 'National City, Wakanda',
  destination: 'National City, Wakanda',
  departureDate: '2018-05-20',
  returnDate: '2018-05-25',
  bedId: 1
};

const mockRequest = {
  id: 1,
  userId: mockUser.userId,
  name: mockUser.fullName,
  manager: mockUser.manager,
  tripType: 'return',
  gender: mockUser.gender,
  department: mockUser.department,
  picture: mockUser.picture,
  role: mockUser.occupation,
  trips: [{ ...mockTrip, requestId: 1 }]
};
const mockGuestHouse = {
  id: 1,
  houseName: "Stan Lee's Suites",
  location: 'National City, Wakanda',
  bathRooms: '2',
  imageUrl: 'https://url-to-picture.png',
  userId: mockUser.userId
};

const mockRoom = {
  id: 1,
  roomName: 'Mock Room 1',
  roomType: 'ensuited',
  bedCount: '2',
  guestHouseId: mockGuestHouse.id
};

const mockBed = {
  id: 1,
  bedName: 'bed 1',
  roomId: mockRoom.id
};

const mockGenerator = {
  center: overrides => ({ ...mockCenter, ...overrides }),

  user: overrides => ({ ...mockUser, ...overrides }),

  trip: overrides => ({ ...mockTrip, ...overrides }),

  request: overrides => ({ ...mockRequest, ...overrides }),

  guestHouse: overrides => ({ ...mockGuestHouse, ...overrides }),

  room: overrides => ({ ...mockRoom, ...overrides }),

  bed: overrides => ({ ...mockBed, ...overrides }),

  // a function for generating mock data for testing the
  // RequestController.sendNotificationToManager method
  mailData: (mailType) => {
    const req = {
      user: {
        UserInfo: { name: 'Dave Mathews', picture: 'https://url-to-image' }
      }
    };
    const res = {};
    const travelRequest = {
      userId: '00023',
      id: '-2s34jkw-m0y',
      manager: 'My manager'
    };
    const trips = [
      {
        id: '-2s34jkw-m0y',
        origin: 'National City, Wakanda',
        destination: 'National City, Wakanda',
        departureDate: '2018-05-20',
        returnDate: '2018-05-25',
        bedId: 1
      }
    ];

    let message;
    let mailTopic;
    if (mailType === 'New Request') {
      message = 'created a new travel request';
      mailTopic = 'New Travel Request';
    } else if (mailType === 'Updated Request') {
      message = 'edited a travel request';
      mailTopic = 'Updated Travel Request';
    } else if (mailType === 'Deleted Request') {
      message = 'deleted a travel request';
      mailTopic = 'Deleted Travel Request';
    }

    return {
      trips,
      req,
      res,
      travelRequest,
      message,
      mailType,
      mailTopic
    };
  }
};

export const emptyRequestResponse = {
  success: false,
  errors: [
    {
      location: 'body',
      param: 'name',
      msg: 'Name  cannot be empty and must be between 3 and 50 characters long'
    },
    {
      location: 'body',
      param: 'manager',
      msg: 'manager cannot be empty'
    },
    {
      location: 'body',
      param: 'tripType',
      msg: 'tripType cannot be empty'
    },
    {
      location: 'body',
      param: 'tripType',
      msg: 'tripType must be "return", "oneWay" or "multi"'
    },
    {
      location: 'body',
      param: 'gender',
      msg: 'gender cannot be empty'
    },
    {
      location: 'body',
      param: 'department',
      msg: 'department cannot be empty'
    },
    {
      location: 'body',
      param: 'role',
      msg: 'role cannot be empty'
    },
    {
      location: 'body',
      param: 'trips',
      msg: 'trips must be an array'
    },
    {
      location: 'body',
      param: 'trips',
      msg: 'trips cannot be empty'
    }
  ]
};

export const newRequest = {
  name: 'Tester Stephen',
  origin: 'Lagos',
  destination: 'New york',
  gender: 'Male',
  manager: 'Travel Admin',
  department: 'TDD',
  role: 'Software Developer',
  tripType: 'return',
  trips: [
    {
      origin: 'Lagos',
      destination: 'New York',
      departureDate,
      returnDate,
      bedId: 1
    }
  ]
};

export const travelAdmin = {
  fullName: 'Travel Admin',
  email: 'travel.admin@andela.com',
  userId: '-HyfghjTUGfghjkIJM',
  passportName: 'Travel Admin',
  location: 'Lagos'
};

export const mockNotificationDetails = {
  mailTopic: 'Deleted Travel Request',
  originType: 'Notify Origin Tavel Team On Request Deletion',
  destinationType: 'Notify Destination Tavel Team On Request Deletion',
  link: '/requests',
  deadLink: '/#'
};

export default mockGenerator;
