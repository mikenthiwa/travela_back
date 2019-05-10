module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Countries', {
    id: {
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      type: Sequelize.INTEGER,
    },
    country: {
      type: Sequelize.STRING,
      allowNull: false
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    regionId: {
      type: Sequelize.INTEGER,
      onDelete: 'set null',
      allowNull: false,
      references: {
        model: 'TravelRegions',
        key: 'id',
        as: 'region'
      }
    }
  }),
  down: queryInterface => queryInterface.dropTable('Countries')
};
