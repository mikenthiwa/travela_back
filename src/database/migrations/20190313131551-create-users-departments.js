module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('UsersDepartments', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
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
    departmentId: {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: {
        model: 'Departments',
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
  down: queryInterface => queryInterface.dropTable('UsersDepartments'),
};
