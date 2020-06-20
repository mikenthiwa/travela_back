
module.exports = {
  // eslint-disable-next-line
  up: (queryInterface, Sequelize) => queryInterface.createTable('Occupations', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    occupationName: {
      allowNull: false,
      type: Sequelize.STRING
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
  // eslint-disable-next-line
  down: (queryInterface, Sequelize) => queryInterface.dropTable('Occupations')
};
