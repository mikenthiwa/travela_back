const user = {
  id: '1000',
  fullName: 'Samuel Kubai',
  email: 'black.windows@andela.com',
  userId: '-MUyHJmKrxA90lPNQ1FOLNm',
  picture: 'Picture',
  location: 'Lagos',
  createdAt: '2018-08-16 012:11:52.181+01',
  updatedAt: '2018-08-16 012:11:52.181+01'
};

const payload = {
  UserInfo: {
    id: '-MUyHJmKrxA90lPNQ1FOLNm',
    name: 'Samuel Kubai',
    email: 'black.windows@andela.com',
  }
};

const validVisa = {
  visa:
    {
      entryType: 'Single',
      country: 'Kenya',
      dateOfIssue: '02-01-2018',
      expiryDate: '06-01-2018',
      visaType: 'Business',
      cloudinaryUrl: 'https://res.cloudinary.com/ined/image/upload/v1538568663/Logo_blue_2x.png'
    }
};

const validVisa2 = {
  visa:
  {
    entryType: 'Multiple',
    country: 'Nigeria',
    dateOfIssue: '02-01-2018',
    expiryDate: '06-01-2018',
    visaType: 'Business',
    cloudinaryUrl: 'https://res.cloudinary.com/ined/image/upload/v1538568663/Logo_blue_2x.png'
  }
};

const invalidDocument = {
  invalid:
    {
      entryType: 'Business',
      country: 'Kenya',
      dateOfIssue: '02-01-2018',
      expiryDate: '06-01-2018',
      visaType: 'Business',
      cloudinaryUrl: 'https://res.cloudinary.com/ined/image/upload/v1538568663/Logo_blue_2x.png'
    },
  countyMissing:
   {
     visa: {
       entryType: 'Multiple',
       name: 'Permit',
       dateOfIssue: '02-01-2018',
       expiryDate: '06-01-2018',
       visaType: 'Business',
       cloudinaryUrl: 'https://res.cloudinary.com/ined/image/upload/v1538568663/Logo_blue_2x.png'
     }
   }
};

const passport = {
  passport: {
    name: 'Mike',
    passportNumber: 'ABC123ab',
    nationality: 'Kenyan ',
    dateOfBirth: '11/02/2010',
    dateOfIssue: '11/02/2017',
    placeOfIssue: 'Kenya',
    expiryDate: '11/02/2018',
    cloudinaryUrl: 'https://res.cloudinary.com/dbk8ky24f/image/upload/v1543520867/oga8ewofyyirrlk9hv.jpg'
  }
};

const travelTeamMember = {
  id: 2000,
  fullName: 'John kalyango',
  email: 'john.kalyango@andela.com',
  createdAt: '2019-01-04 012:11:52.181+01',
  updatedAt: '2019-01-16 012:11:52.181+01',
  userId: '-LJV4b1QTCYewOtk5F63',
  gender: 'male',
  location: 'Lagos',
};

const travelTeamMemberRole = {
  id: 9000,
  userId: 2000,
  roleId: 339458,
  centerId: 12345,
  createdAt: '2019-01-04 012:11:52.181+01',
  updatedAt: '2019-01-16 012:11:52.181+01',
};
const centers = [
  {
    id: 12345,
    location: 'Lagos, Nigeria',
    createdAt: '2018-11-12',
    updatedAt: '2018-11-12'
  },
  {
    id: 34567,
    location: 'Kigali, Rwanda',
    createdAt: '2018-11-12',
    updatedAt: '2018-11-12'
  },
  {
    id: 78901,
    location: 'Austin, United States',
    createdAt: '2018-11-12',
    updatedAt: '2018-11-12'
  }
];
export default {
  user, payload, validVisa, validVisa2, invalidDocument, passport, travelTeamMember, travelTeamMemberRole, centers
};
