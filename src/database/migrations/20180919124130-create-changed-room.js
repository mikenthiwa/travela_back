module.exports = {
  up: (queryInterface, Sequelize) => queryInterface
    .createTable('ChangedRooms', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      requestId: {
        type: Sequelize.STRING,
        onDelete: 'set null',
        allowNull: true,
        references: {
          model: 'Requests',
          key: 'id',
          as: 'request',
        },
      },
      tripId: {
        type: Sequelize.STRING,
        onDelete: 'set null',
        allowNull: true,
        references: {
          model: 'Trips',
          key: 'id',
          as: 'trip',
        },
      },
      bedId: {
        type: Sequelize.INTEGER,
        onDelete: 'set null',
        allowNull: true,
        references: {
          model: 'Beds',
          key: 'id',
          as: 'bed',
        },
      },
      reason: {
        allowNull: false,
        type: Sequelize.STRING
      },
      userId: {
        type: Sequelize.STRING,
        onDelete: 'set null',
        allowNull: false,
        references: {
          model: 'Users',
          key: 'userId',
          as: 'user',
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    }),
  down: queryInterface => queryInterface.dropTable('ChangedRooms')
};
