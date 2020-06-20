
/* eslint-disable */
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Maintainances', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      start: {
        allowNull: false,
        type: Sequelize.DATEONLY,
      },
      end: {
        allowNull: false,
        type: Sequelize.DATEONLY,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
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
    });
  },
  down: queryInterface => queryInterface.dropTable('Maintainances')
};
