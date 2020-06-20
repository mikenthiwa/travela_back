
export const requesterPayload = {
  UserInfo: {
    id: '-AVwHJmKrxA90lPNQ1FOLNn',
    fullName: 'Jack Sparrow',
    email: 'jack.sparrow@andela.com',
    name: 'Jack',
    picture: ''
  },
};

export const travelAdminPayload = {
  UserInfo: {
    id: '-LJV4b1QTDYewOtk5F65',
    fullName: 'Chris Brown',
    email: 'chris.brown@andela.com',
    name: 'Chris',
    picture: '',
    location: 'Lagos'
  }
};

export const requestsData = [
  {
    id: 'xDh20cuGz',
    name: 'James Bond',
    manager: 'Samuel Kubai',
    role: 'Software Developer',
    gender: 'Female',
    department: 'TDD',
    tripType: 'return',
    status: 'Open',
    picture: 'https://sgeeegege',
    userId: '-MUyHJmKrxA90lPNQ1FOLNm',
  },
  {
    id: 'xDh20cuGy',
    name: 'Samuel Jackson',
    manager: 'Samuel Kubai',
    tripType: 'oneWay',
    gender: 'Female',
    department: 'Apprenticeship',
    status: 'Approved',
    picture: 'https://sgeeegege',
    role: 'Software Developer',
    userId: '-MUyHJmKrxA90lPNQ1FOLNm',
  },
  {
    id: 'xDh20cuGx',
    name: 'Stephen Neutron',
    manager: 'Samuel Kubai',
    tripType: 'multi',
    gender: 'Female',
    department: 'TDD',
    status: 'Approved',
    picture: 'https://sgeeegege',
    role: 'Software Developer',
    userId: '-MUyHJmKrxA90lPNQ1FOLNm',
  },
  {
    id: 'xDh20cuGs',
    name: 'Anita Baker',
    manager: 'Samuel Kubai',
    tripType: 'multi',
    gender: 'Male',
    department: 'Operations',
    status: 'Approved',
    picture: 'https://sgeeegege',
    role: 'Software Developer',
    userId: '-MUyHJmKrxA90lPNQ1FOLNm',
  },
  {
    id: 'xDh20cuGhf',
    name: 'Steph Curry',
    manager: 'Samuel Kubai',
    tripType: 'multi',
    gender: 'Male',
    department: 'People',
    status: 'Approved',
    picture: 'https://sgeeegege',
    role: 'Software Developer',
    userId: '-MUyHJmKrxA90lPNQ1FOLNm',
  },
  {
    id: 'xDh20cuGi',
    name: 'Donald Duck',
    manager: 'Samuel Kubai',
    tripType: 'multi',
    gender: 'Male',
    department: 'Technology',
    status: 'Rejected',
    picture: 'https://sgeeegege',
    role: 'Software Developer',
    userId: '-MUyHJmKrxA90lPNQ1FOLNm',
  },
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
export const centers = [
  {
    location: 'Nairobi, Kenya'
  },
  {
    location: 'Lagos, Nigeria'
  },
  {
    location: 'Kigali, Rwanda'
  },
  {
    location: 'New York, United States'
  },
  {
    location: 'Kampala, Uganda'
  }

];
export const tripsData = bedId => ([
  {
    id: 1,
    requestId: 'xDh20cuGz',
    origin: 'Lagos, Nigeria',
    destination: 'Nairobi',
    bedId,
    departureDate: new Date(),
    returnDate: '2018-10-20',
  },
  {
    id: 2,
    requestId: 'xDh20cuGy',
    origin: 'Lagos, Nigeria',
    destination: 'New York',
    bedId,
    departureDate: new Date(),
    returnDate: '2018-10-20',
  },
  {
    id: 3,
    requestId: 'xDh20cuGx',
    origin: 'Lagos, Nigeria',
    destination: 'New York',
    bedId,
    departureDate: new Date(),
    returnDate: '2018-10-20',
  },
  {
    id: 4,
    requestId: 'xDh20cuGs',
    origin: 'Lagos, Nigeria',
    destination: 'New York',
    bedId,
    departureDate: new Date(),
    returnDate: '2018-10-20',
  },
  {
    id: 5,
    requestId: 'xDh20cuGhf',
    origin: 'Lagos, Nigeria',
    destination: 'New York',
    bedId,
    departureDate: new Date(),
    returnDate: '2018-10-20',
  },
  {
    id: 6,
    requestId: 'xDh20cuGi',
    origin: 'New York',
    destination: 'Nairobi',
    bedId,
    departureDate: new Date(),
    returnDate: '2018-10-20',
  }
]);

export const tripsReportResponse = [
  {
    label: 'Apprenticeship',
    value: '1'
  },
  {
    label: 'Operations',
    value: '1'
  },
  {
    label: 'People',
    value: '1'
  },
  {
    label: 'TDD',
    value: '2'
  }
];

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
