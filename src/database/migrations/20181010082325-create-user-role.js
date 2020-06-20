module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('UserRoles', {
    id: {
      allowNull: false,
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: {
        model: 'Users',
        key: 'id',
        onDelete: 'CASCADE',
      }
    },
    roleId: {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: {
        model: 'Roles',
        key: 'id',
        onDelete: 'CASCADE',
      }
    },
    centerId: {
      allowNull: true,
      type: Sequelize.INTEGER,
      references: {
        model: 'Centers',
        key: 'id',
        onDelete: 'CASCADE',
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
  down: queryInterface => (
    queryInterface.dropTable('UserRoles')
  )
};
