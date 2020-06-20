export default (sequelize, DataTypes) => {
  const Rooms = sequelize.define(
    'Rooms', {
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
      beds: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      faulty: {
        allowNull: false,
        defaultValue: false,
        type: DataTypes.BOOLEAN,
      },
    },
  );
  Rooms.associate = (models) => {
    Rooms.belongsTo(models.GuestHouse, {
      foreignKey: 'guestHouseId',
      as: 'guestHouse'
    });
    Rooms.hasMany(models.Bed, {
      foreignKey: 'roomId',
      as: 'bed',
    });
  };
  return Rooms;
};
