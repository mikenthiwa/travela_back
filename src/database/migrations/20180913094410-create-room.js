module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Rooms', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.STRING
    },
    roomName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    roomType: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    bedCount: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    faulty: {
      allowNull: false,
      defaultValue: false,
      type: Sequelize.BOOLEAN,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    guestHouseId: {
      type: Sequelize.STRING,
      onDelete: 'set null',
      allowNull: false,
      references: {
        model: 'GuestHouses',
        key: 'id',
        as: 'guestHouses',
      },
    },
  }),
  down: queryInterface => queryInterface.dropTable('Rooms'),
};
