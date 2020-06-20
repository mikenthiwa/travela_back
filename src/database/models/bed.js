export default (sequelize, DataTypes) => {
  const Bed = sequelize.define(
    'Bed', {
      bedName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      booked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
    },
  );
  Bed.associate = (models) => {
    Bed.belongsTo(models.Room, {
      foreignKey: 'roomId',
      as: 'rooms'
    });
    Bed.hasMany(models.Trip, {
      foreignKey: 'bedId',
      as: 'trips',
    });
    Bed.hasMany(models.ChangedRoom, {
      foreignKey: 'bedId',
      as: 'changedRooms',
    });
  };
  return Bed;
};
