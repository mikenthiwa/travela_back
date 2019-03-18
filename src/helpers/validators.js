import { query, body } from 'express-validator/check';
import moment from 'moment';

const date = new Date();
const minDate = new Date(date.setDate(date.getDate() - 1));

export const getRequestsValidators = [
  query('status', 'Status must be "open", "past", "approved", "rejected" or "verified"')
    .isIn(['open', 'approved', 'past', 'rejected', 'verified'])
    .optional(),
  query('page', 'Page must be a positive integer')
    .isInt({ gt: 0 })
    .optional(),
  query('limit', 'Limit must be a positive integer')
    .isInt({ gt: 0 })
    .optional(),
];

export const editAndCreateRequestValidators = [
  body('name',
    'Name  cannot be empty and must be between 3 and 50 characters long')
    .trim().isLength({ min: 3, max: 50 }),
  body('manager', 'manager cannot be empty').trim().not().isEmpty(),
  body('stipend', 'stipend must be an integer and not less than zero')
    .optional().isInt({ gt: -1 }),
  body('stipendBreakdown')
    .optional()
    .isArray()
    .withMessage('stipendBreakdown must be an array')
    .custom((value) => {
      if (!Array.isArray(value)) return false;
      for (let x = 0; x < value.length; x += 1) {
        if (value[x].subTotal === undefined) {
          throw new Error(`subTotal is missing for object at position ${x + 1}`);
        }
      }
      return true;
    }),
  body('tripType').trim()
    .not().isEmpty()
    .withMessage('tripType cannot be empty')
    .isIn(['return', 'multi', 'oneWay'])
    .withMessage('tripType must be "return", "oneWay" or "multi"'),
  body('gender', 'gender cannot be empty').trim().not().isEmpty(),
  body('department', 'department cannot be empty').trim().not().isEmpty(),
  body('role', 'role cannot be empty').trim().not().isEmpty(),
  body('trips')
    .isArray()
    .withMessage('trips must be an array')
    .custom((value, { req }) => {
      if (!value) {
        throw new Error('trips cannot be empty');
      }
      if (req.body.tripType === 'multi' && value.length <= 1) {
        throw new Error('A multi trip must have more than one trip');
      }
      if (req.body.tripType !== 'multi' && value.length !== 1) {
        throw new Error(`A ${req.body.tripType} trip must have one trip`);
      }
      return true;
    }),
  body('trips.*.origin', 'origin cannot be empty').trim().not().isEmpty(),
  body('trips.*.destination', 'destination cannot be empty').trim()
    .not().isEmpty(),
  body('trips.*.departureDate')
    .isISO8601()
    .withMessage('Please specify a valid ISO departure date')
    .isAfter(minDate.toISOString())
    .withMessage('Date must not be less than today'),
  body('trips.*.returnDate').trim()
    .custom((value, { req }) => {
      if (req.body.tripType === 'return'
        && !moment(value, moment.ISO_8601, true)
          .isValid()) {
        throw new Error('Please specify a valid ISO return date');
      }
      return true;
    }),
  body('trips.*.bedId', 'bed id is an integer and optional').optional(),
  body('trips.*').custom((value, { req }) => {
    if (req.body.tripType !== 'oneWay'
        && moment(value.returnDate, moment.ISO_8601, true).isValid()
        && moment(value.departureDate, moment.ISO_8601, true).isValid()
        && value.returnDate <= value.departureDate) {
      throw new Error('returnDate must be greater than departureDate');
    }
    return true;
  }),
];

export const validateChecklistItem = [
  body('name').trim().not().isEmpty()
    .withMessage('Name is required'),
  body('requiresFiles').trim().not().isEmpty()
    .withMessage('Requires Files is required')
    .isBoolean()
    .withMessage('Requires Files should be true or false'),
  body('resources')
    .isArray()
    .withMessage('Resources must be an array'),
  body('resources.*.label')
    .trim().not().isEmpty()
    .withMessage('Label is required'),
  body('resources.*.link')
    .trim().not().isEmpty()
    .withMessage('Link is required')
];

export const deleteChecklistItem = [
  body('deleteReason',
    'Reason for deletion is required')
    .trim().isLength({ min: 3, }),
];

// type can be file or json
export const travelReadinessValidators = [
  query('page', 'Page must be a positive integer')
    .isInt({ gt: 0 })
    .optional(),
  query('limit', 'Limit must be a positive integer')
    .isInt({ gt: 0 })
    .optional(),
  query('type', 'Type must be a string')
    .isString(''),
  query('travelFlow', 'Travel flow should either be inflow or outflow')
    .isIn(['inflow', 'outflow'])
];
