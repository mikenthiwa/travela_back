export const checkListItems = [
  {
    id: '1',
    name: 'visa application',
    requiresFiles: true,
    deleteReason: null,
    destinationName: 'Kigali, Rwanda',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null
  },
  {
    id: '2',
    name: 'travel stipend',
    requiresFiles: false,
    deleteReason: null,
    destinationName: 'Kigali, Rwanda',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null
  },
  {
    id: '3',
    name: 'Travel Ticket Details',
    requiresFiles: false,
    deleteReason: null,
    destinationName: 'New York, United States',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null
  },
  {
    id: '4',
    name: 'visa application',
    requiresFiles: true,
    deleteReason: null,
    destinationName: 'New York, United States',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null
  },
  {
    id: '5',
    name: 'Travel stipend',
    requiresFiles: false,
    deleteReason: null,
    destinationName: 'Nairobi, Kenya',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null
  },
  {
    id: '6',
    name: 'visa application',
    requiresFiles: true,
    deleteReason: null,
    destinationName: 'Nairobi, Kenya',
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
    destinationName: 'Lagos, Nigeria',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null
  },
  {
    id: '101',
    name: 'Green card',
    requiresFiles: true,
    deleteReason: 'not needed',
    destinationName: 'Nigeria',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: '2018-11-01T13:34:20.109Z',
  }
];

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
    id: '5',
    label: 'National Identity',
    link: 'http://nira.ids.com',
    checklistItemId: '101'
  }
];

export const checklistSubmissions = [
  {
    id: '1',
    value: 'submitted',
    tripId: '1',
    checklistItemId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null
  },
  {
    id: '2',
    value: 'submitted',
    tripId: '2',
    checklistItemId: '4',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null
  },
  {
    id: '3',
    value: 'submitted',
    tripId: '3',
    checklistItemId: '8',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null
  },
];

export const usersRequired = [
  {
    userId: '-dfsdfdfdsdfds',
    fullName: 'Soft Boy',
    email: 'soft.boy@andela.com',
    picture: 'IAmTravelAdmin.png',
    roleId: 29187,
    location: 'Lagos',
  },
  {
    userId: '-MUnaemKrxA90lPNQ1FOLNm',
    fullName: 'Sweetness',
    email: 'sweetness@andela.com',
    picture: 'IAmNotATravelAdmin.png',
    roleId: 401938,
    location: 'Lagos',
  }
];

export const role = [
  {
    id: 10948,
    roleName: 'Super Administrator',
    description: 'Can perform all task on travela',
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01'
  },
  {
    id: 29187,
    roleName: 'Travel Administrator',
    description: 'Can view and approve all request on  travela',
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01'
  },
  {
    id: 339458,
    roleName: 'Travel Team Member',
    description: 'Can view all request made on travela',
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01'
  },
  {
    id: 401938,
    roleName: 'Requester',
    description: 'Can make travel request',
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01'
  },
  {
    id: 53019,
    roleName: 'Manager',
    description: 'Can request and approve travel request ',
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01'
  }
];
