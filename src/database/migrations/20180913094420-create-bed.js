module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Beds', {
    id: {
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      type: Sequelize.INTEGER,
    },
    bedName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    roomId: {
      type: Sequelize.STRING,
      onDelete: 'set null',
      allowNull: false,
      references: {
        model: 'Rooms',
        key: 'id',
        as: 'rooms',
      },
    },
  }),
  down: queryInterface => queryInterface.dropTable('Beds'),
};
