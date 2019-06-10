module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('FlightEstimates', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    originRegion: {
      type: Sequelize.STRING,
    },
    destinationRegion: {
      type: Sequelize.STRING,
    },
    originCountry: {
      type: Sequelize.STRING,
    },
    destinationCountry: {
      type: Sequelize.STRING,
    },
    createdBy: {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'userId',
        as: 'user',
      },
    },
    amount: {
      allowNull: false,
      type: Sequelize.INTEGER
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    deletedAt: {
      allowNull: true,
      type: Sequelize.DATE
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE
    }
  }),
  down: queryInterface => queryInterface.dropTable('FlightEstimates')
};
