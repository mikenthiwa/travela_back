

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('ChecklistOrigins', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    checklistId: {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: {
        model: 'Checklists',
        key: 'id',
        as: 'checklist',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    countryId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Countries',
        key: 'id',
        as: 'country'
      }
    },
    regionId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'TravelRegions',
        key: 'id',
        as: 'region'
      }
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
  down: queryInterface => queryInterface.dropTable('ChecklistOrigins')
};
