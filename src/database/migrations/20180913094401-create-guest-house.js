module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('GuestHouses', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.STRING
    },
    houseName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    location: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    bathRooms: {
      allowNull: false,
      type: Sequelize.INTEGER,
    },
    imageUrl: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    userId: {
      type: Sequelize.STRING,
      onDelete: 'set null',
      allowNull: false,
      references: {
        model: 'Users',
        key: 'userId',
        as: 'users',
      },
    },
  }),
  down: queryInterface => queryInterface.dropTable('GuestHouses'),
};
