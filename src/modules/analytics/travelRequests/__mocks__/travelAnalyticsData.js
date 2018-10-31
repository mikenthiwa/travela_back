export const userPayload = {
  UserInfo: {
    id: '-AVwHJmKrxA90lPNQ1FOLNn',
    fullName: 'John Doe',
    email: 'john.doe@andela.com',
    name: 'John',
    picture: ''
  }
};

export const travelAdminPayload = {
  UserInfo: {
    id: '-LJV4b1QTDYewOtk5F65',
    fullName: 'Calvin Klein',
    email: 'calvin.klein@andela.com',
    name: 'Calvin',
    picture: ''
  }
};

export const requestsData = [
  {
    id: 'xDh20cuGz',
    name: 'John Doe',
    manager: 'Samuel Kubai',
    role: 'Software Developer',
    gender: 'male',
    department: 'TDD',
    tripType: 'return',
    status: 'Open',
    picture: 'https://pic.com',
    userId: '-AVwHJmKrxA90lPNQ1FOLNn',
    createdAt: '2018-10-30',
    updatedAt: '2018-10-30'
  }
];
export const userRole = {
  id: 50,
  userId: 1983,
  roleId: 29187,
  createdAt: '2018-10-25',
  updatedAt: '2018-10-25'
};
export const superAdminRole = {
  id: 52,
  userId: 1983,
  roleId: 10948,
  createdAt: '2018-10-25',
  updatedAt: '2018-10-25'
};
export const tripsData = bedId => [
  {
    id: 1,
    requestId: 'xDh20cuGz',
    origin: 'Nairobi, Kenya',
    destination: 'Lagos, Nigeria',
    bedId,
    departureDate: '2018-10-29',
    returnDate: '2018-10-31',
  }
];
export const travelAdmin = {
  id: 1983,
  fullName: 'Calvin Klein',
  email: 'calvin.klein@andela.com',
  createdAt: '2018-08-16 012:11:52.181+01',
  updatedAt: '2018-08-16 012:11:52.181+01',
  userId: '-LJV4b1QTDYewOtk5F65',
  gender: 'male',
  location: 'Nairobi, Kenya'
};
export const travelRequester = {
  id: 1990,
  fullName: 'John Doe',
  email: 'john.doe@andela.com',
  createdAt: '2018-08-16 012:11:52.181+01',
  updatedAt: '2018-08-16 012:11:52.181+01',
  userId: '-AVwHJmKrxA90lPNQ1FOLNn',
  gender: 'male',
  location: 'Nairobi'
};
export const analyticsResopnse = {
  success: true,
  data: {
    total_requests: 1,
    pending_requests: 1,
    people_visiting: 0,
    people_leaving: 1,
    travel_duration_breakdown: {
      durations: [
        {
          name: '3 days',
          value: 1
        }
      ],
      total: 1
    },
    travel_lead_time_breakdown: {
      lead_times: [
        {
          name: '0 days',
          value: 1
        }
      ],
      total: 1
    }
  }
};
export const postGuestHouse = {
  houseName: 'Qwetu Jogoo',
  location: 'Nairobi, Kenya',
  bathRooms: '1',
  imageUrl: 'https://www.picture.com',
  rooms: [
    {
      roomName: 'master view',
      roomType: 'ensuited',
      bedCount: '2'
    }
  ]
};