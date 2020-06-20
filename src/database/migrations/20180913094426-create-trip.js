module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Trips', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.STRING
    },
    requestId: {
      allowNull: false,
      type: Sequelize.STRING,
      references: {
        model: 'Requests',
        key: 'id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      }
    },
    origin: {
      allowNull: false,
      type: Sequelize.STRING
    },
    destination: {
      allowNull: false,
      type: Sequelize.STRING
    },
    departureDate: {
      allowNull: false,
      type: Sequelize.DATEONLY
    },
    returnDate: {
      allowNull: true,
      type: Sequelize.DATEONLY
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    bedId: {
      type: Sequelize.INTEGER,
      onDelete: 'set null',
      allowNull: true,
      references: {
        model: 'Beds',
        key: 'id',
        as: 'beds',
      },
    },
  }),
  down: queryInterface => queryInterface.dropTable('Trips')
};
