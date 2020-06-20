module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('HotelEstimates', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    amount: {
      type: Sequelize.INTEGER
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    deletedAt: {
      allowNull: true,
      type: Sequelize.DATE
    },
    createdBy: {
      type: Sequelize.INTEGER,
      onDelete: 'set null',
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
        as: 'user',
      },
    },
    countryId: {
      type: Sequelize.INTEGER,
      onDelete: 'CASCADE',
      allowNull: true,
      references: {
        model: 'Countries',
        key: 'id',
        as: 'countryId',
      },
    },
    regionId: {
      type: Sequelize.INTEGER,
      onDelete: 'CASCADE',
      allowNull: true,
      references: {
        model: 'TravelRegions',
        key: 'id',
        as: 'regionId',
      },
    }
  }),
  down: queryInterface => queryInterface.dropTable('HotelEstimates')
};
