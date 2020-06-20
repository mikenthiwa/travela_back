import Utils from '../../helpers/Utils';
import models from '../../database/models';
import { EditGuestHouseHelper } from '../../helpers/guestHouse/index';
import GuestHouseController from './GuestHouseController';

export default class GuestHouseTransactions {
  static async postGuestHouseTransaction(req, res, guestHouse, rooms) {
    let createdRooms;
    await models.sequelize.transaction(async () => {
      const house = await models.GuestHouse.create(guestHouse);
      createdRooms = await models.Room.bulkCreate(rooms.map(room => ({
        ...room, id: Utils.generateUniqueId(), guestHouseId: house.id
      })));
      const makeBed = await Promise.all(
        createdRooms.map(async (roomId) => {
          const bedNumber = roomId.bedCount;
          const createdBed = Promise.all(
            new Array(+bedNumber).fill(1).map((__, i) => {
              const newBed = models.Bed.create({
                roomId: roomId.id,
                bedName: `bed ${i + 1}`
              });
              return newBed;
            })
          );
          return createdBed;
        })
      );
      res.status(201).json({
        success: true,
        message: 'Guest House created successfully',
        guestHouse: house,
        rooms: createdRooms,
        bed: makeBed
      });
    });
  }

  static async editGustHouseTransaction(
    req, res, houseName, location, bathRooms, imageUrl, genderPolicy, rooms
  ) {
    await models.sequelize.transaction(async () => {
      const foundGuestHouse = await models.GuestHouse.findOne({
        attributes: ['id'],
        where: { id: req.params.id, disabled: false }
      });
      const guestHouseData = Object.values(foundGuestHouse);
      const guestHouseId = guestHouseData[0].id;
      if (!guestHouseId) {
        return Error.handleError('Guest house does not exist', 404, res);
      }
      const updatedGuestHouse = await foundGuestHouse.update({
        houseName, location, bathRooms, imageUrl, genderPolicy
      });
      const updatedRooms = await EditGuestHouseHelper.updateRooms(rooms, guestHouseId);
      const newUpdatedRoomsId = updatedRooms.map(updatedRoom => (updatedRoom.id));
      const deleted = await EditGuestHouseHelper.deleteRoomsRemoved(guestHouseId, newUpdatedRoomsId);
      if (!deleted) {
        return res.status(409).json({
          success: false,
          error: `You cannot disable this room as it 
          is currently assigned to a travel requester, kindly 
          re-assign the travel requester to another room before disabling`
        });
      }
      const updatedBeds = await GuestHouseController.updateBeds(updatedRooms, res);
      return res.status(200).json({
        success: true,
        message: 'Guest house updated successfully',
        guestHouse: updatedGuestHouse,
        rooms: updatedRooms,
        bed: updatedBeds
      });
    });
  }
}
