export default (sequelize, DataTypes) => {
  const Room = sequelize.define(
    'Room', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.STRING
      },
      roomName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      roomType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      bedCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      faulty: {
        allowNull: false,
        defaultValue: false,
        type: DataTypes.BOOLEAN,
      },
    },
  );
  Room.associate = (models) => {
    Room.belongsTo(models.GuestHouse, {
      foreignKey: 'guestHouseId',
      as: 'guestHouses'
    });
    Room.hasMany(models.Bed, {
      foreignKey: 'roomId',
      as: 'beds',
    });
    Room.hasMany(models.Maintainance, {
      foreignKey: 'roomId',
      as: 'maintainances',
    });
  };
  return Room;
};
