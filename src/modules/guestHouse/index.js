import express from 'express';
import GuestHouseController from './GuestHouseController';
import middlewares from '../../middlewares';
import GuestHouseValidator from '../../middlewares/guestHouseValidator';


const { authenticate, RoleValidator } = middlewares;
const Router = express.Router();

Router.get(
  '/guesthouses',
  authenticate,
  RoleValidator.checkUserRole([
    'Super Administrator',
    'Travel Administrator',
    'Travel Team Member'
  ]),
  GuestHouseController.getGuestHouses
);

Router.post(
  '/guesthouses',
  authenticate,
  RoleValidator.checkUserRole([
    'Super Administrator',
    'Travel Administrator',
    'Travel Team Member'
  ]),
  GuestHouseValidator.validateImage,
  GuestHouseValidator.validateGuestHouse,
  GuestHouseValidator.validateGuestHouseDataSet,
  GuestHouseValidator.validateGenderPolicy,
  GuestHouseController.postGuestHouse
);

Router.get(
  '/availablerooms',
  authenticate,
  GuestHouseValidator.validateAvailableRooms,
  GuestHouseController.getAvailableRooms
);

Router.put(
  '/room/:id',
  authenticate,
  RoleValidator.checkUserRole([
    'Super Administrator',
    'Travel Administrator',
    'Travel Team Member'
  ]),
  GuestHouseValidator.checkFaultRoomStatus,
  GuestHouseController.updateRoomFaultyStatus
);

Router.put('/guesthouses/:id',
  authenticate,
  RoleValidator.checkUserRole(
    ['Super Administrator', 'Travel Administrator', 'Travel Team Member']
  ),
  GuestHouseValidator.validateImage,
  GuestHouseValidator.validateGuestHouse,
  GuestHouseValidator.validateGuestHouseDataSet,
  GuestHouseValidator.validateGenderPolicy,
  GuestHouseController.editGuestHouse);

Router.get(
  '/guesthouses/:guestHouseId',
  authenticate,
  GuestHouseValidator.checkDate,
  RoleValidator.checkUserRole(
    ['Super Administrator', 'Travel Administrator', 'Travel Team Member']
  ),
  GuestHouseController.getGuestHouseDetails
);

Router.post(
  '/room/:id/maintainance',
  authenticate,
  RoleValidator.checkUserRole([
    'Super Administrator',
    'Travel Administrator',
    'Travel Team Member'
  ]),
  GuestHouseValidator.validateMaintainanceRecord,
  GuestHouseValidator.checkRoom,
  GuestHouseController.createMaintainanceRecord
);

Router.put(
  '/room/:id/maintainance',
  authenticate,
  RoleValidator.checkUserRole([
    'Super Administrator',
    'Travel Administrator',
    'Travel Team Member'
  ]),
  GuestHouseValidator.validateMaintainanceRecord,
  GuestHouseValidator.checkRoom,
  GuestHouseValidator.checkMaintenanceRecord,
  GuestHouseController.updateMaintenanceRecord
);

Router.delete(
  '/room/:id/maintainance',
  authenticate,
  RoleValidator.checkUserRole([
    'Super Administrator',
    'Travel Administrator',
    'Travel Team Member'
  ]),
  GuestHouseValidator.checkRoom,
  GuestHouseValidator.checkMaintenanceRecord,
  GuestHouseController.deleteMaintenanceRecord
);

Router.put(
  '/guesthouse/:id',
  authenticate,
  RoleValidator.checkUserRole([
    'Super Administrator',
    'Travel Administrator',
    'Travel Team Member'
  ]),
  GuestHouseController.disableOrRestoreGuesthouse
);

Router.get(
  '/disabledguesthouses',
  authenticate,
  RoleValidator.checkUserRole([
    'Super Administrator',
    'Travel Administrator',
    'Travel Team Member'
  ]),
  GuestHouseController.getDisabledGuestHouses
);

export default Router;
