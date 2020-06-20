
export default (sequelize, DataTypes) => {
  const GuestHouse = sequelize.define(
    'GuestHouse', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.STRING,
      },
      houseName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      location: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      bathRooms: {
        allowNull: false,
        type: DataTypes.STRING
      },
      imageUrl: {
        allowNull: false,
        type: DataTypes.STRING
      },
      genderPolicy: {
        allowNull: false,
        type: DataTypes.STRING,
        defaultValue: 'Unisex'
      },
      disabled: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },
  );
  GuestHouse.associate = (models) => {
    GuestHouse.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'users'
    });

    GuestHouse.hasMany(models.Room, {
      foreignKey: 'guestHouseId',
      as: 'rooms',
    });
  };
  return GuestHouse;
};
