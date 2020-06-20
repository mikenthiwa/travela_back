module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Departments', 'parentDepartment', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Departments',
        key: 'id',
        as: 'parentDepartment'
      }
    });
    await queryInterface.addColumn('Departments', 'createdBy', {
      allowNull: true,
      type: Sequelize.STRING,
      onDelete: 'set null',
      references: {
        model: 'Users',
        key: 'userId',
        as: 'createdBy'
      }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('Departments', 'parentDepartment');
    await queryInterface.removeColumn('Departments', 'createdBy');
  }
};
