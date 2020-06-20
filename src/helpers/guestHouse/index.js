import _ from 'lodash';
import Utils from '../Utils';
import models from '../../database/models';

export class BedName {
  static numberRange(start, end) {
    return Array(end - start + 1).fill().map((item, index) => start + index);
  }

  static getAvailableBedNames(max, bedNamesTaken) {
    // Get available bed names
    const maxBedNumber = this.numberRange(1, max);
    const bedNameValues = bedNamesTaken.map(bed => bed.bedName);
    const availableBedNames = [];
    maxBedNumber.map((num) => {
      if (!bedNameValues.includes(`bed ${num}`)) {
        availableBedNames.push(`bed ${num}`);
      }
      return num;
    });

    return availableBedNames;
  }
}


export class GuestHouseIncludeHelper {
  static doInclude(modelName, alias, where = {}, required = true) {
    return {
      model: models[modelName],
      as: alias,
      where,
      required // set false to enforce a LEFT OUTER JOIN
    };
  }

  static makeTripsDateClauseFrom(reqQuery) {
    const { startDate, endDate } = reqQuery;
    const { makeTripsWhereClauseFor } = GuestHouseIncludeHelper;

    return models.sequelize.or(
      // pick a trip if its departureDate is between dates
      makeTripsWhereClauseFor('departureDate', 'between', startDate, endDate),
      /*  also include trips whose departureDate is less than startDate but
        touch into or span across the date range
      */
      models.sequelize.and(
        makeTripsWhereClauseFor('departureDate', 'lt', startDate),
        makeTripsWhereClauseFor('returnDate', 'gte', startDate)
      )
    );
  }

  static makeTripsWhereClauseFor(column, operatorType, startDate, endDate) {
    const { Op } = models.Sequelize;
    const { sequelize } = models;
    const operator = Op[operatorType]; // Op.between, Op.lt ...
    const opValue = operatorType === 'between'
      ? [startDate, endDate]
      : startDate;
    return sequelize.where(sequelize.col(column), { [operator]: opValue });
  }
}

export class EditGuestHouseHelper {
  // Delete rooms removed while editing
  static async deleteRoomsRemoved(guestHouseId, newUpdatedRoomsId) {
    const findAllRoomsIdInGuestHouse = await models.Room.findAll({
      attributes: ['id'],
      where: { guestHouseId, isDeleted: false },
      raw: true
    });
    const allRoomsId = findAllRoomsIdInGuestHouse.map(room => room.id);
    const roomsToRemoveId = _.difference(allRoomsId, newUpdatedRoomsId);
    const tripsWithRemovedBeds = await models.Trip.findAll({
      attributes: ['deletedAt', 'checkOutDate'],
      include: [{
        model: models.Bed,
        as: 'beds',
        where: { roomId: roomsToRemoveId[0] }
      }],
      raw: true
    });
    const tripsWithRemovedRooms = tripsWithRemovedBeds.filter(
      trips => trips.checkOutDate === null && trips.deletedAt === null
    );
    if (tripsWithRemovedRooms.length) {
      return false;
    }
    roomsToRemoveId.map(async (roomId) => {
      const deleteTheseRooms = await models.Room.findById(roomId);
      await deleteTheseRooms.update({ isDeleted: true });
    });
    return true;
  }

  // Update rooms
  static async updateRooms(updatedRooms, guestHouseId) {
    const arrayOfRooms = [];
    await Promise.all(
      updatedRooms.map(async (room) => {
        if (!room.id) {
          await models.sequelize.transaction(async () => {
            const createdRoom = await models.Room.create({
              ...room,
              id: Utils.generateUniqueId(),
              guestHouseId
            });
            await Promise.all(
              new Array(+createdRoom.bedCount).fill(1).map(async (__, i) => {
                const newBed = await models.Bed.create({
                  roomId: createdRoom.id,
                  bedName: `bed ${i + 1}`
                });
                return newBed;
              })
            );
            arrayOfRooms.push(createdRoom.dataValues);
          });
        } else {
          const foundRoom = await models.Room.findById(room.id);
          const updateRoom = await foundRoom.update({
            roomName: room.roomName,
            roomType: room.roomType,
            bedCount: room.bedCount
          });
          arrayOfRooms.push(updateRoom.dataValues);
        }
      }),
    );
    return arrayOfRooms;
  }
}
