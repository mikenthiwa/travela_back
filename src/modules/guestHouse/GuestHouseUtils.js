import models from '../../database/models';
import Error from '../../helpers/Error';
import {
  BedName
} from '../../helpers/guestHouse/index';

const { Op } = models.Sequelize;

export default class GuestHouseUtils {
  static async getOppositeRoomId(oppositeBedIDSql) {
    const oppositeRoomIDSql = models.sequelize.dialect.QueryGenerator.selectQuery(
      'Beds',
      {
        attributes: ['roomId'],
        where: {
          id: {
            [Op.in]: models.sequelize.literal(`(${oppositeBedIDSql})`)
          }
        }
      }
    ).slice(0, -1);

    return oppositeRoomIDSql;
  }

  static async getOppositRequestSql(gender) {
    const oppositeRequestSql = models.sequelize.dialect.QueryGenerator.selectQuery(
      'Requests',
      {
        attributes: ['id'],
        where: {
          gender: { [Op.ne]: gender }
        }
      }
    ).slice(0, -1);
    return oppositeRequestSql;
  }

  static async bedsToCreate(BookedBeds, newBedNumbers) {
    return BookedBeds && Math.abs(newBedNumbers - BookedBeds.length);
  }

  static async getBedNames({
    newBedNumbers, roomId, foundBeds, BookedBeds
  }) {
    let numberOfBedsToCreate = [];
    let availableBedNames = [];
    if (foundBeds && (newBedNumbers > foundBeds.length)) {
      numberOfBedsToCreate = Math.abs(newBedNumbers - foundBeds.length);
      availableBedNames = BedName.getAvailableBedNames(newBedNumbers, foundBeds);
    } else {
      await models.Bed.destroy({ where: { roomId, booked: false } });
      availableBedNames = (BookedBeds && BookedBeds.length)
        ? BedName.getAvailableBedNames(foundBeds.length, BookedBeds) : [];
      numberOfBedsToCreate = GuestHouseUtils.bedsToCreate(BookedBeds);
    }
    return { numberOfBedsToCreate, availableBedNames };
  }

  static async getFoundBeds(res, room, roomId) {
    const newBedNumbers = Number(room.bedCount);
    const BookedBeds = await models.Bed.findAll({ where: { roomId, booked: true }, raw: true });
    if (BookedBeds.length > newBedNumbers) {
      return Error.handleError(`There are currently ${BookedBeds.length} booked beds, 
      unable to update bed numbers`, 409, res);
    }
    const foundBeds = await models.Bed.findAll({ where: { roomId }, raw: true });
    return { newBedNumbers, foundBeds, BookedBeds };
  }

  static async updateBedsSql(rooms, res) {
    const updatedBeds = await Promise.all(
      rooms.map(async (room) => {
        const roomId = room.id;
        const { newBedNumbers, foundBeds, BookedBeds } = await GuestHouseUtils.getFoundBeds(res, room, roomId);
        if (newBedNumbers === foundBeds.length) { return foundBeds; }
        const {
          numberOfBedsToCreate = [],
          availableBedNames = []
        } = await GuestHouseUtils.getBedNames({
          newBedNumbers, foundBeds, BookedBeds, roomId
        });
        const newBeds = [];
        for (let i = 0; i < numberOfBedsToCreate; i += 1) {
          const newBed = { roomId, bedName: availableBedNames[i] || `bed ${i + 1}` };
          newBeds.push(newBed);
        }
        await models.Bed.bulkCreate(newBeds);
        const createdBeds = await models.Bed.findAll({ where: { roomId } });
        return createdBeds;
      })
    );
    return updatedBeds;
  }
}
