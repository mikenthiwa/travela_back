export const checkListItems = [
  {
    id: '1',
    name: 'visa application',
    requiresFiles: true,
    deleteReason: null,
    destinationName: 'Rwanda',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null
  },
  {
    id: '2',
    name: 'travel stipend',
    requiresFiles: false,
    deleteReason: null,
    destinationName: 'Rwanda',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null
  },
  {
    id: '3',
    name: 'Travel Ticket Details',
    requiresFiles: false,
    deleteReason: null,
    destinationName: 'United States',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null
  },
  {
    id: '4',
    name: 'visa application',
    requiresFiles: true,
    deleteReason: null,
    destinationName: 'United States',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null
  },
  {
    id: '5',
    name: 'Travel stipend',
    requiresFiles: false,
    deleteReason: null,
    destinationName: 'Kenya',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null
  },
  {
    id: '6',
    name: 'visa application',
    requiresFiles: true,
    deleteReason: null,
    destinationName: 'Kenya',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null
  },
  {
    id: '7',
    name: 'travel stipend',
    requiresFiles: false,
    deleteReason: null,
    destinationName: 'Nigeria',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null
  },
  {
    id: '8',
    name: 'visa application',
    requiresFiles: true,
    deleteReason: null,
    destinationName: 'Nigeria',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null
  },
  {
    id: '9',
    name: 'yellow card',
    requiresFiles: false,
    deleteReason: null,
    destinationName: 'Nigeria',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null
  },
  {
    id: '10',
    name: 'green card',
    requiresFiles: false,
    deleteReason: null,
    destinationName: 'Lagos, Nigeria',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null
  }
];

export const centers = ['Kenya', 'Nigeria', 'Rwanda', 'United States', 'Uganda'].map(location => ({
  location
}));

const date = new Date();
const dateToday = new Date(date.setDate(date.getDate()))
  .toISOString().split('T')[0];
const dateDeparture = new Date(date.setDate(date.getDate() + 1))
  .toISOString().split('T')[0];
const dateReturn = new Date(date.setDate(date.getDate() + 3))
  .toISOString().split('T')[0];

export const dates = {
  departureDate: dateDeparture,
  returnDate: dateReturn,
  dateToday
};
export const tripsData = [
  {
    id: 1,
    requestId: 'request-id-6',
    origin: 'Nairobi',
    destination: 'New York',
    bedId: 1,
    departureDate: dates.departureDate,
    returnDate: dates.returnDate,
  },
  {
    id: 2,
    requestId: 'request-id-7',
    origin: 'New York',
    destination: 'Kenya',
    bedId: 1,
    departureDate: dates.dateToday,
    returnDate: dates.returnDate,
  },
  {
    id: 3,
    requestId: 'request-id-8',
    origin: 'New York',
    destination: 'Kenya',
    bedId: 1,
    departureDate: '2018-09-27',
    returnDate: dates.returnDate,
  },
];
export const defaultItem = {
  id: '10',
  name: 'Travel Ticket',
  requiresFiles: false,
  deleteReason: null,
  destinationName: 'Default',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null
};

export const checkListItemsResources = [
  {
    id: '1',
    link: 'http://kigali.visa.com',
    label: 'Application Guide',
    checklistItemId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null
  },
  {
    id: '2',
    link: 'http://newyork.visa.com',
    label: 'Application Guide',
    checklistItemId: '4',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null
  },
  {
    id: '3',
    link: 'http://lagos.visa.com',
    label: 'Application Guide',
    checklistItemId: '8',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null
  },
  {
    id: '4',
    link: 'http://nairobi.visa.com',
    label: 'Application Guide',
    checklistItemId: '6',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null
  },
  {
    id: '7',
    link: 'http://nairobi.visa.com',
    label: 'Application Guide',
    checklistItemId: '7',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null
  },
];

export const checklistSubmissions = [
  {
    id: '1',
    value: 'submitted',
    tripId: 'trip-11',
    checklistItemId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    documentId: null,
  },
  {
    id: '2',
    value: 'submitted',
    tripId: 'change',
    checklistItemId: '4',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    documentId: null,
  },
  {
    id: '3',
    value: 'submitted',
    tripId: 'trip-13',
    checklistItemId: '8',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    documentId: null,
  },
  {
    id: '4',
    value: 'submitted',
    tripId: 'trip-12',
    checklistItemId: '6',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    documentId: null,
  },
  {
    id: '5',
    value: 'submitted',
    tripId: 'trip-19',
    checklistItemId: '6',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    documentId: null,
  },
  {
    id: '6',
    value: 'submitted',
    tripId: 'trip-19',
    checklistItemId: '6',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    documentId: null,
  },
  {
    id: '7',
    value: 'submitted',
    tripId: 'trip-19',
    checklistItemId: '6',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    documentId: null,
  },
  {
    id: '8',
    value: 'submitted',
    tripId: 'trip-19',
    checklistItemId: '6',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    documentId: null,
  },
];

export const trips = [
  {
    id: 'trip-10',
    origin: 'Lagos, Nigeria',
    destination: 'Kigali, Rwanda',
    departureDate: '2018-11-02',
    returnDate: '2019-02-10',
    checkStatus: 'Not Checked In',
    notificationCount: 0,
    createdAt: '2018-10-05T08:36:11.170Z',
    updatedAt: '2018-10-05T08:36:11.170Z',
    bedId: 1,
    requestId: 'request-id-6',
    checkInDate: '2018-11-03'
  },
  {
    id: 'trip-11',
    origin: 'Kigali, Rwanda',
    destination: 'New York, United States',
    departureDate: '2018-11-02',
    returnDate: '2019-02-10',
    checkStatus: 'Not Checked In',
    notificationCount: 0,
    createdAt: '2018-10-05T08:36:11.170Z',
    updatedAt: '2018-10-05T08:36:11.170Z',
    bedId: 1,
    requestId: 'request-id-6',
    checkInDate: '2018-11-03'
  },
  {
    id: 'trip-12',
    origin: 'New York, United States',
    destination: 'Nairobi, Kenya',
    departureDate: '2018-11-02',
    returnDate: '2019-02-10',
    checkStatus: 'Not Checked In',
    notificationCount: 0,
    createdAt: '2018-10-05T08:36:11.170Z',
    updatedAt: '2018-10-05T08:36:11.170Z',
    bedId: 2,
    requestId: 'request-id-6',
    checkInDate: '2018-11-03'
  },
  {
    id: 'trip-13',
    origin: 'New York, United States',
    destination: 'Osolin, Poland',
    departureDate: '2018-11-02',
    returnDate: '2019-02-10',
    checkStatus: 'Not Checked In',
    notificationCount: 0,
    createdAt: '2018-10-05T08:36:11.170Z',
    updatedAt: '2018-10-05T08:36:11.170Z',
    bedId: 2,
    requestId: 'request-id-7',
    checkInDate: '2018-11-03'
  },
  {
    id: 'trip-19',
    origin: 'New York, United States',
    destination: 'Osolin, Poland',
    departureDate: '2018-11-02',
    returnDate: '2019-02-10',
    checkStatus: 'Not Checked In',
    notificationCount: 0,
    createdAt: '2018-10-05T08:36:11.170Z',
    updatedAt: '2018-10-05T08:36:11.170Z',
    bedId: 2,
    requestId: 'request-id-9',
    checkInDate: '2018-11-03'
  },
];

export const requests = [
  {
    id: 'request-id-6',
    name: 'Samuel Kubai',
    status: 'Open',
    gender: 'Male',
    manager: 'Ogooluwa Akinola',
    department: 'TDD',
    role: 'Senior Consultant',
    tripType: 'multi',
    picture: 'test.photo.test',
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01',
    userId: '-MUyHJmKrxA90lPNQ1FOLNm'
  },
  {
    id: 'request-id-7',
    name: 'Samuel Kubai',
    status: 'Open',
    gender: 'Male',
    manager: 'Ogooluwa Akinola',
    department: 'TDD',
    role: 'Senior Consultant',
    tripType: 'return',
    picture: 'test.photo.test',
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01',
    userId: '-MUyHJmKrxA90lPNQ1FOLNm'
  },
  {
    id: 'request-id-8',
    name: 'Samuel Kubai',
    status: 'Verified',
    gender: 'Male',
    manager: 'Ogooluwa Akinola',
    department: 'TDD',
    role: 'Senior Consultant',
    tripType: 'return',
    picture: 'test.photo.test',
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01',
    userId: '-MUyHJmKrxA90lPNQ1FOLNm'
  },
  {
    id: 'request-id-9',
    name: 'Samuel Kubai',
    status: 'Verified',
    gender: 'Male',
    manager: 'Ogooluwa Akinola',
    department: 'TDD',
    role: 'Senior Consultant',
    tripType: 'return',
    picture: 'test.photo.test',
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01',
    userId: '-MUyHJmKrxA90lPNQ1FOLNm'
  }
];

export const approvedRequests = {
  id: 'request-id-6',
  name: 'Samuel Kubai',
  status: 'Approved',
  gender: 'Male',
  manager: 'Ogooluwa Akinola',
  department: 'TDD',
  role: 'Senior Consultant',
  tripType: 'multi',
  picture: 'test.photo.test',
  createdAt: '2018-08-16 012:11:52.181+01',
  updatedAt: '2018-08-16 012:11:52.181+01',
  userId: '-MUyHJmKrxA90lPNQ1FOLNm'
};

export const lagosCheckListResponse = {
  destinationName: 'Nigeria',
  checklist: [
    {
      id: '8',
      name: 'visa application',
      requiresFiles: true,
      destinationName: 'Nigeria',
      deleteReason: null,
      resources: [
        {
          id: '3',
          label: 'Application Guide',
          link: 'http://lagos.visa.com',
          checklistItemId: '8'
        }
      ]
    },
    {
      id: '9',
      name: 'yellow card',
      requiresFiles: false,
      destinationName: ' Nigeria',
      deleteReason: null,
      resources: []
    },
    {
      id: '7',
      name: 'travel stipend',
      requiresFiles: false,
      destinationName: 'Nigeria',
      deleteReason: null,
      resources: []
    }
  ]
};

export const nairobiCheckListResponse = {
  destinationName: 'Kenya',
  checklist: [
    {
      id: '5',
      name: 'Travel stipend',
      requiresFiles: false,
      destinationName: 'Kenya',
      deleteReason: null,
      resources: []
    },
    {
      id: '6',
      name: 'visa application',
      requiresFiles: true,
      destinationName: 'Kenya',
      deleteReason: null,
      resources: [
        {
          id: '4',
          label: 'Application Guide',
          link: 'http://nairobi.visa.com',
          checklistItemId: '6'
        }
      ]
    }
  ]
};
export const nairobiCheckListResponse2 = {
  destinationName: 'Kenya',
  checklist: [
    {
      id: '5',
      name: 'Travel stipend',
      requiresFiles: false,
      destinationName: 'Kenya',
      deleteReason: null,
      resources: []
    },
    {
      id: '6',
      name: 'visa application',
      requiresFiles: true,
      destinationName: 'Kenya',
      deleteReason: null,
      resources: [
        {
          id: '4',
          label: 'Application Guide',
          link: 'http://nairobi.visa.com',
          checklistItemId: '6'
        }
      ]
    }
  ]
};

export const kigaliCheckListResponse = {
  destinationName: 'Rwanda',
  checklist: [
    {
      id: '1',
      name: 'visa application',
      requiresFiles: true,
      destinationName: 'Rwanda',
      deleteReason: null,
      resources: [
        {
          id: '1',
          label: 'Application Guide',
          link: 'http://kigali.visa.com',
          checklistItemId: '1'
        }
      ]
    },
    {
      id: '2',
      name: 'travel stipend',
      requiresFiles: false,
      destinationName: 'Rwanda',
      deleteReason: null,
      resources: []
    }
  ]
};

export const newyorkCheckListResponse = {
  destinationName: 'United States',
  checklist: [
    {
      id: '3',
      name: 'Travel Ticket Details',
      requiresFiles: false,
      destinationName: 'United States',
      deleteReason: null,
      resources: []
    },
    {
      id: '4',
      name: 'visa application',
      requiresFiles: true,
      destinationName: 'United States',
      deleteReason: null,
      resources: [
        {
          id: '2',
          label: 'Application Guide',
          link: 'http://newyork.visa.com',
          checklistItemId: '4'
        }
      ]
    }
  ]
};
export const newyorkCheckListResponse2 = {
  destinationName: 'United States',
  checklist: [
    {
      id: '4',
      name: 'visa application',
      requiresFiles: true,
      destinationName: 'United States',
      deleteReason: null,
      resources: [
        {
          id: '2',
          label: 'Application Guide',
          link: 'http://newyork.visa.com',
          checklistItemId: '4'
        }
      ]
    },
    {
      id: '3',
      name: 'Travel Ticket Details',
      requiresFiles: false,
      destinationName: 'United States',
      deleteReason: null,
      resources: []
    },
  ]
};

const defaultItemResponse = {
  name: 'Travel Ticket',
  id: '10',
  requiresFiles: false,
  destinationName: 'Default',
  deleteReason: null,
  resources: []
};

export const checklistWithDefaultResponse = [
  {
    ...kigaliCheckListResponse,
    checklist: [...kigaliCheckListResponse.checklist, defaultItemResponse],
    tripId: 'trip-10'
  },
  {
    ...nairobiCheckListResponse,
    checklist: [...nairobiCheckListResponse.checklist, defaultItemResponse],
    tripId: 'trip-12'
  },
  {
    ...newyorkCheckListResponse,
    checklist: [...newyorkCheckListResponse.checklist, defaultItemResponse],
    tripId: 'trip-11'
  },
];


export const guestHouse = {
  id: 'guestHouse-1',
  houseName: 'test-house',
  location: 'anonymous',
  bathRooms: '6',
  imageUrl: 'https://image.com',
  userId: '-MUyHJmKrxA90lPNQ1FOLNm',
  createdAt: '2018-08-16 012:11:52.181+01',
  updatedAt: '2018-08-16 012:11:52.181+01'
};

export const rooms = [
  {
    id: 'room-1',
    roomName: 'test-room',
    roomType: 'ensuited',
    bedCount: '2',
    faulty: false,
    guestHouseId: 'guestHouse-1',
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01'
  }
];

export const beds = [
  {
    id: '1',
    bedName: 'bed 1',
    roomId: 'room-1',
    booked: false,
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01'
  },
  {
    id: '2',
    bedName: 'bed 2',
    roomId: 'room-1',
    booked: false,
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01'
  }
];

export const user = [
  {
    id: 10000,
    fullName: 'black window ',
    email: 'black.window@andela.com',
    userId: '-MUyHJmKrxA90lPNQ1FOLNm',
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01',
    location: 'Lagos'
  },
  {
    id: 10010,
    fullName: 'Samuel Kubai',
    userId: '-MUyHJmKrxA90lPNOLNm',
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01',
    location: 'Lagos',
    email: 'samuel.kubai@andela.com'
  }
];

export const expectedResponse = {
  success: true,
  message: 'travel checklist retrieved successfully',
  travelChecklists: [
    {
      destinationName: 'Rwanda',
      checkList: [
        {
          id: 1,
          name: 'visa application',
          requiresFiles: true,
          destinationName: 'Rwanda',
          deleteReason: null,
          resources: [
            {
              id: 1,
              label: 'Application Guide',
              link: 'http://kigali.visa.com',
              checklistItemId: 1
            }
          ],
          submissions: [
            {
              id: 1,
              value: 'submitted',
              tripId: 'trip-10',
              checklistItemId: 1
            }
          ]
        },
        {
          id: 2,
          name: 'travel stipend',
          requiresFiles: false,
          destinationName: 'Rwanda',
          deleteReason: null,
          resources: [],
          submissions: []
        }
      ]
    },
    {
      destinationName: 'United States',
      checkList: [
        {
          id: 4,
          name: 'visa application',
          requiresFiles: true,
          destinationName: 'United States',
          deleteReason: null,
          resources: [
            {
              id: 2,
              label: 'Application Guide',
              link: 'http://newyork.visa.com',
              checklistItemId: 4
            }
          ],
          submissions: [
            {
              id: 2,
              value: 'submitted',
              tripId: 'trip-11',
              checklistItemId: 4
            }
          ]
        },
        {
          id: 3,
          name: 'Travel Ticket Details',
          requiresFiles: false,
          destinationName: 'United States',
          deleteReason: null,
          resources: [],
          submissions: []
        }
      ]
    },
    {
      destinationName: 'Nigeria',
      checkList: [
        {
          id: 8,
          name: 'visa application',
          requiresFiles: true,
          destinationName: 'Nigeria',
          deleteReason: null,
          resources: [
            {
              id: 3,
              label: 'Application Guide',
              link: 'http://lagos.visa.com',
              checklistItemId: 8
            }
          ],
          submissions: [
            {
              id: 3,
              value: 'submitted',
              tripId: 'trip-12',
              checklistItemId: 8
            }
          ]
        },
        {
          id: 9,
          name: 'yellow card',
          requiresFiles: false,
          destinationName: 'Nigeria',
          deleteReason: null,
          resources: [],
          submissions: []
        },
        {
          id: 7,
          name: 'travel stipend',
          requiresFiles: false,
          destinationName: 'Nigeria',
          deleteReason: null,
          resources: [],
          submissions: []
        }
      ]
    },
    {
      destinationName: 'Kenya',
      checkList: [
        {
          id: 6,
          name: 'visa application',
          requiresFiles: true,
          destinationName: 'Kenya',
          deleteReason: null,
          resources: [
            {
              id: 4,
              label: 'Application Guide',
              link: 'http://nairobi.visa.com',
              checklistItemId: 6
            }
          ],
          submissions: []
        },
        {
          id: 5,
          name: 'Travel stipend',
          requiresFiles: false,
          destinationName: 'Kenya',
          deleteReason: null,
          resources: [],
          submissions: []
        }
      ]
    }
  ]
};

export const documentsData = [
  {
    id: 'SyOyr_AtC',
    type: 'visa',
    data: {
      imageName: 'image1.jpg',
      entryType: 'H-2A',
      country: 'Kenya',
      dateOfIssue: '02-01-2018',
      expiryDate: '06-01-2018',
      cloudinaryUrl: 'https://res.cloudinary.com/ined/image/upload/v1538568663/Logo_blue_2x.png'
    },
    userId: '-MUyHJmKrxA90lPNQ1FOLNm',
    createdAt: '2019-01-04 012:11:52.181+01',
    updatedAt: '2019-01-16 012:11:52.181+01',
  },
  {
    id: 'b9gnYkdzG',
    type: 'visa',
    data: {
      imageName: 'image2.jpg',
      entryType: 'H-2A',
      country: 'Kenya',
      dateOfIssue: '02-01-2018',
      expiryDate: '06-01-2018',
      cloudinaryUrl: 'https://res.cloudinary.com/ined/image/upload/v1538568663/Logo_blue_2x.png'
    },
    userId: '-MUyHJmKrxA90lPNQ1FOLNm',
    createdAt: '2019-01-04 012:11:52.181+01',
    updatedAt: '2019-01-16 012:11:52.181+01',
  },
  {
    id: 'pk42DLnx4C',
    type: 'passport',
    data: {
      imageName: 'image2.jpg',
      passportNumber: 'qw357etrty',
      nationality: 'kenyan',
      dateOfBirth: '1970-01-01',
      dateOfIssue: '2018-11-01',
      placeOfIssue: 'Kenya',
      expiryDate: '2029-11-01',
      cloudinaryUrl: 'https://res.cloudinary.com/dbk8ky2'
    },
    userId: '-MUyHJmKrxA90lPNQ1FOLNm',
    createdAt: '2019-01-04 012:11:52.181+01',
    updatedAt: '2019-01-16 012:11:52.181+01',
  },
];

export const commentMock = {
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
};
