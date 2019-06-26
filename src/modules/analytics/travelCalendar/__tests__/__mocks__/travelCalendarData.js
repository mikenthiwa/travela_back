
export const requesterPayload = {
  UserInfo: {
    id: '-AVwHJmKrxA90lPNQ1FOLNn',
    fullName: 'Jack Sparrow',
    email: 'jack.sparrow@andela.com',
    name: 'Jack',
    picture: ''
  },
};

export const travelAdmin = {
  id: 1983,
  fullName: 'Chris Brown',
  email: 'chris.brown@andela.com',
  createdAt: '2018-08-16 012:11:52.181+01',
  updatedAt: '2018-08-16 012:11:52.181+01',
  userId: '-LJV4b1QTDYewOtk5F65',
  gender: 'male',
  location: 'Lagos',
};

export const travelAdminPayload = {
  UserInfo: {
    id: '-LJV4b1QTDYewOtk5F65',
    fullName: 'Chris Brown',
    email: 'chris.brown@andela.com',
    name: 'Chris',
    picture: ''
  }
};

export const userRole = {
  id: 50,
  userId: 1983,
  roleId: 29187,
  createdAt: '2018-10-25',
  updatedAt: '2018-10-25'
};

export const centers = [
  {
    id: 1,
    location: 'Nairobi, Kenya',
    createdAt: '2018-11-12',
    updatedAt: '2018-11-12'
  },
  {
    id: 2,
    location: 'New York, United States',
    createdAt: '2018-11-12',
    updatedAt: '2018-11-12'
  },
  {
    id: 3,
    location: 'Kigali, Rwanda',
    createdAt: '2018-11-12',
    updatedAt: '2018-11-12'
  }
];

export const travelRequester = {
  id: 1990,
  fullName: 'Jack Sparrow',
  email: 'jack.sparrow@andela.com',
  createdAt: '2018-08-16 012:11:52.181+01',
  updatedAt: '2018-08-16 012:11:52.181+01',
  userId: '-AVwHJmKrxA90lPNQ1FOLNn',
  gender: 'male',
  location: 'Lagos'
};

export const requestsData = [
  {
    id: 'xDh20cuGy',
    name: 'Jack Sparrow',
    manager: 1990,
    tripType: 'oneWay',
    gender: 'Female',
    department: 'Apprenticeship',
    status: 'Approved',
    picture: 'https://sgeeegege',
    role: 'Software Developer',
    userId: '-AVwHJmKrxA90lPNQ1FOLNn',
  },
  {
    id: 'xDh20cuGz',
    name: 'Jack Sparrow',
    manager: 1990,
    tripType: 'return',
    gender: 'Female',
    department: 'Apprenticeship',
    status: 'Approved',
    picture: 'https://sgeeegege',
    role: 'Software Developer',
    userId: '-AVwHJmKrxA90lPNQ1FOLNn',
  },
  {
    id: 'xDh20cuGx',
    name: 'Jack Sparrow',
    manager: 1990,
    tripType: 'multi',
    gender: 'Female',
    department: 'Apprenticeship',
    status: 'Approved',
    picture: 'https://sgeeegege',
    role: 'Software Developer',
    userId: '-AVwHJmKrxA90lPNQ1FOLNn',
  },
];

export const superAdminRole = {
  id: 52,
  userId: 1983,
  roleId: 10948,
  createdAt: '2018-10-25',
  updatedAt: '2018-10-25'
};

export const tripsData = bedId => ([
  {
    id: 1,
    requestId: 'xDh20cuGy',
    origin: 'Lagos, Nigeria',
    destination: 'Nairobi, Kenya',
    bedId,
    departureDate: '2018-11-21',
    returnDate: '2018-11-21',
  },
  {
    id: 2,
    requestId: 'xDh20cuGz',
    origin: 'Nairobi, Kenya',
    destination: 'Lagos, Nigeria',
    bedId,
    departureDate: '2018-11-21',
    returnDate: '2018-11-21',
  },
  {
    id: 3,
    requestId: 'xDh20cuGx',
    origin: 'Lagos, Nigeria',
    destination: 'Nairobi, Kenya',
    bedId,
    departureDate: '2018-11-21',
    returnDate: '2018-11-21',
  },
  {
    id: 4,
    requestId: 'xDh20cuGx',
    origin: 'Nairobi, Kenya',
    destination: 'Kigali, Rwanda',
    bedId,
    departureDate: '2018-11-21',
    returnDate: '2018-11-21',
  },
]);

export const submissionsData = [
  {
    id: 'Z9eWhF2ho',
    userUpload: '{"departureTime":"2018-01-01T00:00","arrivalTime":"2018-01-01T00:00","airline":"Kenya Airways","ticketNumber":"KQ 345","returnDepartureTime":"","returnTime":"","returnTicketNumber":"","returnAirline":""}',
    tripId: '1',
    checklistItemId: '1',
    createdAt: '2018-11-21',
    updatedAt: '2018-11-21',
  },
  {
    id: 'Z9eWhF2hi',
    userUpload: '{"departureTime":"2018-01-01T00:00","arrivalTime":"2018-01-01T00:00","airline":"Kenya Airways","ticketNumber":"KQ 345","returnDepartureTime":"2018-01-01T00:00","returnTime":"2018-01-01T00:00","returnTicketNumber":"KQ 173","returnAirline":"Kenya Airways"}',
    tripId: '2',
    checklistItemId: '1',
    createdAt: '2018-11-21',
    updatedAt: '2018-11-21',
  },
  {
    id: 'Z9eWhF2he',
    userUpload: '{"departureTime":"2018-01-01T00:00","arrivalTime":"2018-01-01T00:00","airline":"Kenya Airways","ticketNumber":"KQ 345","returnDepartureTime":"2018-01-01T00:00","returnTime":"2018-01-01T00:00","returnTicketNumber":"KQ 173","returnAirline":"Kenya Airways"}',
    tripId: '3',
    checklistItemId: '1',
    createdAt: '2018-11-21',
    updatedAt: '2018-11-21',
  },
  {
    id: 'Z9eWhF2hd',
    userUpload: '{"departureTime":"2018-01-01T00:00","arrivalTime":"2018-01-01T00:00","airline":"Kenya Airways","ticketNumber":"KQ 345","returnDepartureTime":"2018-01-01T00:00","returnTime":"2018-01-01T00:00","returnTicketNumber":"KQ 173","returnAirline":"Kenya Airways"}',
    tripId: '4',
    checklistItemId: '1',
    createdAt: '2018-11-21',
    updatedAt: '2018-11-21',
  }
];

export const postGuestHouse = {
  houseName: 'Mini flat',
  location: 'Lagos Nigeria',
  bathRooms: '1',
  imageUrl: 'https://www.lol.com',
  rooms: [
    {
      roomName: 'big cutter',
      roomType: 'ensuited',
      bedCount: '10'
    },
    {
      roomName: 'small cutter',
      roomType: 'non-ensuited',
      bedCount: '10'
    }
  ]
};
