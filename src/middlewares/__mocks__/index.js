const mockAuthenticate = (req, res, next) => {
  const user = { UserInfo: { id: '-LJV4b1QTCYewOtk5F63' } };
  req.user = user;
  return next();
};

const invokeNextMiddleware = (req, res, next) => next();

const mockValidateDirectReport = (req, res, next) => {
  const request = { id: 1, name: 'Michelle Smith', status: 'Approved' };
  req.request = request;
  return next();
};

const mockGetUserId = (req, res, next) => {
  const user = { id: 1 };
  req.user = user;
  next();
};


const middleware = {
  authenticate: jest.fn(mockAuthenticate),
  Validator: {
    validateRequest: jest.fn(invokeNextMiddleware),
    validateCreateRequests: jest.fn(invokeNextMiddleware),
    checkEmail: jest.fn(invokeNextMiddleware),
    checkGender: jest.fn(invokeNextMiddleware),
    validateStatus: jest.fn(invokeNextMiddleware),
    validateBudgetStatus: jest.fn(invokeNextMiddleware),
    validateWorkInformation: jest.fn(invokeNextMiddleware),
    validateManager: jest.fn(invokeNextMiddleware),
    validateComment: jest.fn(invokeNextMiddleware),
    validateNotificationStatus: jest.fn(invokeNextMiddleware),
    validateCreateGuestHouse: jest.fn(invokeNextMiddleware),
    checkUrl: jest.fn(invokeNextMiddleware),
    getUserId: jest.fn(mockGetUserId),
    centerExists: jest.fn(mockGetUserId),
    validateChecklistQuery: jest.fn(invokeNextMiddleware),
    getUserFromDb: jest.fn(invokeNextMiddleware),
    checkSignedInUser: jest.fn(invokeNextMiddleware),
    checkSignedInUserOrAdmin: jest.fn(invokeNextMiddleware),
    validateNewCentre: jest.fn(invokeNextMiddleware),
    validateTeamMemberLocation: jest.fn(invokeNextMiddleware),
    verifyToken: jest.fn(invokeNextMiddleware),
    verifyLoginEmail: jest.fn(invokeNextMiddleware)

  },
  RoleValidator: {
    validateUpdateRole: jest.fn(() => invokeNextMiddleware),
    validateRoleAssignment: jest.fn(invokeNextMiddleware),
    roleExists: jest.fn(invokeNextMiddleware),
    checkUserRole: jest.fn(() => invokeNextMiddleware),
    validateAddRole: jest.fn(invokeNextMiddleware),
    validateUserRole: jest.fn(invokeNextMiddleware),
    checkUserRoleById: jest.fn(invokeNextMiddleware),
    validateChecklistQuery: jest.fn(invokeNextMiddleware),
    validateRequestIdQuery: jest.fn(invokeNextMiddleware),
    validateDestinationNameQuery: jest.fn(invokeNextMiddleware),
    validateMaintainanceRecord: jest.fn(invokeNextMiddleware),
    validateUser: jest.fn(invokeNextMiddleware),
    validatePersonalInformation: jest.fn(invokeNextMiddleware)
  },
  TravelStipendValidator: {
    validateNewStipend: jest.fn(invokeNextMiddleware),
    checkCenter: jest.fn(invokeNextMiddleware),
    validateUpdatePayload: jest.fn(invokeNextMiddleware),
    validateUpdateParams: jest.fn(invokeNextMiddleware),
    validateTravelStipendsLocations: jest.fn(invokeNextMiddleware)
  },
  tripValidator: {
    validateCheckType: jest.fn(invokeNextMiddleware),
    checkTripExists: jest.fn(invokeNextMiddleware),
    checkTripOwner: jest.fn(invokeNextMiddleware),
    checkTripVerified: jest.fn(invokeNextMiddleware),
    checkTravelAdmin: jest.fn(invokeNextMiddleware),
    validateBed: jest.fn(invokeNextMiddleware),
    checkBedExists: jest.fn(invokeNextMiddleware),
    isBedAvailable: jest.fn(invokeNextMiddleware),
    validateReason: jest.fn(invokeNextMiddleware),
    isRoomFaulty: jest.fn(invokeNextMiddleware),
    isGenderAllowed: jest.fn(invokeNextMiddleware),
    checkTripCheckedOut: jest.fn(invokeNextMiddleware),
    validateTripValidator: jest.fn(invokeNextMiddleware)
  },
  analyticsValidator: {
    validateFilterAndType: jest.fn(invokeNextMiddleware)
  },
  travelCalendarValidator: {
    validateRequestQuery: jest.fn(invokeNextMiddleware)
  },
  validateDirectReport: jest.fn(mockValidateDirectReport),
  DocumentsValidator: {
    validateDocumentName: jest.fn(invokeNextMiddleware),
    checkDocumentName: jest.fn(invokeNextMiddleware),
    getDocumentFromDb: jest.fn(invokeNextMiddleware),
    validateCloudinaryPayload: jest.fn(invokeNextMiddleware)
  },
  ChecklistValidator: {
    validateSubmission: jest.fn(invokeNextMiddleware),
    validateTrip: jest.fn(invokeNextMiddleware),
    validateUniqueItem: jest.fn(invokeNextMiddleware),
    getChecklistItem: jest.fn(invokeNextMiddleware)
  },
  guestHouseValidator: {
    checkRoom: jest.fn(invokeNextMiddleware),
    checkMaintenanceRecord: jest.fn(invokeNextMiddleware),
    checkFaultRoomStatus: jest.fn(invokeNextMiddleware),
    validateGuestHouse: jest.fn(invokeNextMiddleware),
    validateMaintainanceRecord: jest.fn(invokeNextMiddleware),
    checkDate: jest.fn(invokeNextMiddleware),
    validateGuestHouseDataSet: jest.fn(invokeNextMiddleware),
    validateAvailableRooms: jest.fn(invokeNextMiddleware),
    validateImage: jest.fn(invokeNextMiddleware)
  },
  RequestValidator: {
    checkTripBeds: jest.fn(invokeNextMiddleware),
    validateTripBeds: jest.fn(invokeNextMiddleware),
    checkStatusIsApproved: jest.fn(invokeNextMiddleware),
    validateRequestHasTrips: jest.fn(invokeNextMiddleware),
    validateDepartureDate: jest.fn(invokeNextMiddleware),
    validateCheckListComplete: jest.fn(invokeNextMiddleware),
    getTravelaUser: jest.fn(invokeNextMiddleware)
  },
  TravelReadinessDocumentValidator: {
    validateInput: jest.fn(invokeNextMiddleware),
    validateUniqueVisa: jest.fn(invokeNextMiddleware),
    validateUniqueDocument: jest.fn(invokeNextMiddleware),
    checkDocumentAndUser: jest.fn(invokeNextMiddleware),
    checkScanDocument: jest.fn(invokeNextMiddleware)
  },
  ReminderEmailTemplateValidator: {
    validateUniqueName: jest.fn(invokeNextMiddleware),
    validateReminderEmailTemplate: jest.fn(invokeNextMiddleware),
    validateCCEmails: jest.fn(invokeNextMiddleware),
    validateReqParams: jest.fn(invokeNextMiddleware)
  },
  DocumentValidator: {
    validatInput: jest.fn(invokeNextMiddleware),
    validateUniqueDocument: jest.fn(invokeNextMiddleware),
    addTravelReadinessDocument: jest.fn(invokeNextMiddleware)
  },
  ReminderValidator: {
    validateReminder: jest.fn(invokeNextMiddleware),
    validateReminderTemplates: jest.fn(invokeNextMiddleware),
    validateUniqueReminderCondition: jest.fn(invokeNextMiddleware),
    checkIfConditionExists: jest.fn(invokeNextMiddleware),
    validateReason: jest.fn(invokeNextMiddleware),
    checkIfDisabledConditionExists: jest.fn(invokeNextMiddleware),
    checkReminderWithId: jest.fn(invokeNextMiddleware),
    checkUniqueFrequency: jest.fn(invokeNextMiddleware),
    getConditionById: jest.fn(invokeNextMiddleware),
    validateDisability: jest.fn(invokeNextMiddleware)
  },
  TravelReasonsValidator: {
    verifyTravelReasonBody: jest.fn(invokeNextMiddleware),
    verifyTitle: jest.fn(invokeNextMiddleware),
    verifyId: jest.fn(invokeNextMiddleware),
    validateParams: jest.fn(invokeNextMiddleware),
    checkTravelReason: jest.fn(invokeNextMiddleware),
    validateTravelReasonId: jest.fn(invokeNextMiddleware),
    verifyParam: jest.fn(invokeNextMiddleware),
  },
  DepartmentValidation: {
    validateDepartment: jest.fn(invokeNextMiddleware),
    validateBudgetCheckerDepartments: jest.fn(() => invokeNextMiddleware),
    validateRoleDepartment: jest.fn(invokeNextMiddleware),
  },
  BambooWebhookValidator: {
    dataValidator: jest.fn(invokeNextMiddleware),
    validateSecretKey: jest.fn(invokeNextMiddleware),
    validateBambooUsers: jest.fn(invokeNextMiddleware),
    validateRequest: jest.fn(invokeNextMiddleware),
  },
  TravelRegionsValidator: {
    conditionValidation: jest.fn(invokeNextMiddleware),
    inputValidation: jest.fn(invokeNextMiddleware),
  },
  CountryValidator: {
    regionExistsValidation: jest.fn(invokeNextMiddleware),
    inputValidation: jest.fn(invokeNextMiddleware),
    countryExistsValidation: jest.fn(invokeNextMiddleware),
  },
  HotelEstimateValidator: {
    validateNewEstimate: jest.fn(invokeNextMiddleware),
    searchForRegion: jest.fn(invokeNextMiddleware),
    searchForCountry: jest.fn(invokeNextMiddleware),
    checkLocation: jest.fn(invokeNextMiddleware),
    validateEditEstimate: jest.fn(invokeNextMiddleware),
    checkHotelEstimate: jest.fn(invokeNextMiddleware)
  },
  TripModificationValidator: {
    checkExistingRequest: jest.fn(invokeNextMiddleware),
    checkExistingModification: jest.fn(invokeNextMiddleware),
    validateModification: jest.fn(invokeNextMiddleware),
    validateRequest: jest.fn(invokeNextMiddleware),
    validateApproval: jest.fn(invokeNextMiddleware),
    validateDuplicateModification: jest.fn(invokeNextMiddleware)
  },
  FlightEstimateValidator: {
    checkOrOriginDestination: jest.fn(invokeNextMiddleware),
    validateQueryString: jest.fn(invokeNextMiddleware),
    validateEstimateUpadate: jest.fn(invokeNextMiddleware),
    validateFlightEstimate: jest.fn(invokeNextMiddleware),
    validateId: jest.fn(invokeNextMiddleware)
  },
  DynamicChecklistValidator: {
    validateChecklistRequest: jest.fn(invokeNextMiddleware),
    validateChecklistOriginDestination: jest.fn(invokeNextMiddleware),
  },
  ErrorBoundaryValidator: {
    validateCrashReport: jest.fn(invokeNextMiddleware)
  }
};

export default middleware;
