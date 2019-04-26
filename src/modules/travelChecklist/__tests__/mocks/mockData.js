
const date = new Date();
const dateDeparture = new Date(date.setDate(date.getDate() + 1))
  .toISOString().split('T')[0];
const dateReturn = new Date(date.setDate(date.getDate() + 3))
  .toISOString().split('T')[0];

export const dates = {
  departureDate: dateDeparture,
  returnDate: dateReturn,
};

export const checklistSubmission = {
  id: '1',
  value: {
    url: 'http://res.cloudinary.com/travela/raw/upload/v1540191551/w26o4c86mw4047ttwfld',
    secureUrl: 'https://res.cloudinary.com/travela/raw/upload/v1540191551/w26o4c86mw4047ttwfld',
    publicId: 'w26o4c86mw4047ttwfld',
    fileName: 'airticket.pdf'
  },
  tripId: 'trip-12',
  checklistItemId: '46664'
};

export const guestHouse = {
  houseName: 'Mini flat',
  location: 'Lagos Nigeria',
  bathRooms: '1',
  imageUrl: 'ded',
  id: 'AbDdUS9we',
  userId: '-AVwHJmKrxA90lPNQ1FOLNn'
};

export const userData = {
  id: 1234,
  fullName: 'Mark Marcus',
  email: 'mark.marcus@andela.com',
  name: 'Mark',
  userId: '-AVwHJmKrxA90lPNQ1FOLNn',
  passportName: 'Mark Marcus',
  department: 'Success',
  occupation: 'software developer',
  manager: 'Samuel Kubai',
  gender: 'female',
  location: 'Nairobi',
  roleId: '29187',
  createdAt: '2018-08-16 012:11:52.181+01',
  updatedAt: '2018-08-16 012:11:52.181+01',
};

export const roomData = {
  roomName: 'big cutter',
  faulty: false,
  guestHouseId: 'AbDdUS9we',
  id: 1,
  bedCount: 1,
  roomType: 'ensuited'
};

export const bedData = [{
  id: 1,
  bedName: 'bed 1',
  roomId: 1

},
{
  id: 2,
  bedName: 'bed 2',
  roomId: 1

}];

export const tripsMock = [
  {
    id: 'trip-12',
    requestId: '35678',
    origin: 'Nairobi',
    destination: 'Nairobi',
    bedId: 1,
    departureDate: dates.departureDate,
    returnDate: dates.returnDate,
  },
  {
    id: 'trip-13',
    requestId: '99999',
    origin: 'Nairobi',
    destination: 'New York, United States',
    bedId: 2,
    departureDate: dates.departureDate,
    returnDate: dates.returnDate,
  }
];

export const requestMock = [
  {
    id: '35678',
    name: 'Test user A',
    manager: 'Samuel Kubai',
    role: 'Software Developer',
    gender: 'Female',
    department: 'TDD',
    tripType: 'return',
    status: 'Approved',
    userId: '-AVwHJmKrxA90lPNQ1FOLNn',
    picture: 'https://sgeeegege',
  },
  {
    id: '99999',
    name: 'Test user A',
    manager: 'Samuel Kubai',
    role: 'Software Developer',
    gender: 'Female',
    department: 'TDD',
    tripType: 'return',
    status: 'Open',
    userId: '-AVwHJmKrxA90lPNQ1FOLNn',
    picture: 'https://sgeeegege',
  },
];

export const travelChecklists = [
  {
    destination: 'Kampala, Uganda',
    checklist: [
      {
        id: 1,
        name: 'Visa Application',
        resources: [{
          checklistItemId: 1,
          id: 2,
          label: 'Application guide',
          link: 'https://google.com/application-guide'
        },
        ],
        requiresFiles: true,
        deleteReason: null,
      }, {
        id: 2,
        name: 'Ticket Information',
        resources: [{
          checklistItemId: 2,
          id: 1,
          label: null,
          link: 'https://google.com/application-guide'
        },
        ],
        requiresFiles: false,
        deleteReason: null,
      },
      {
        id: 3,
        name: 'Interpol Letter',
        resources: [{
          checklistItemId: 3,
          id: 1,
          label: null,
          link: 'https://google.com/application-guide'
        },
        ],
        requiresFiles: true,
        deleteReason: null,
      }
    ]
  },
  {
    destination: 'Lagos, Nigeria',
    checklist: [{
      id: 8,
      name: 'Visa Application',
      resources: [{
        checklistItemId: 1,
        id: 2,
        label: 'Application guide',
        link: 'https://google.com/application-guide'
      },
      ],
      requiresFiles: true,
      deleteReason: null,
    }, {
      id: 9,
      name: 'Yellow Fever',
      resources: [{
        checklistItemId: 2,
        id: 1,
        label: null,
        link: 'https://google.com/application-guide'
      },
      ],
      requiresFiles: true,
      deleteReason: null,
    },
    {
      id: 7,
      name: 'Ticket Information',
      resources: [{
        checklistItemId: 2,
        id: 1,
        label: null,
        link: 'https://google.com/application-guide'
      },
      ],
      requiresFiles: false,
      deleteReason: null,
    }
    ]
  }
];

export const checklist = {
  id: '46664',
  destinationName: 'Default',
  name: 'Travel Stipend',
  requiresFiles: false,
  deleteReason: null,
};
