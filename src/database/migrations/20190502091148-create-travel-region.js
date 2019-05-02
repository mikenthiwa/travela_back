module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('TravelRegions', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    region: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    description: {
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
    }
  }),
  down: queryInterface => queryInterface.dropTable('TravelRegions'),
};
