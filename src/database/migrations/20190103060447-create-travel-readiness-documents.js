
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('TravelReadinessDocuments', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.STRING
    },
    type: {
      allowNull: false,
      type: Sequelize.STRING
    },
    data: {
      allowNull: false,
      type: Sequelize.JSONB
    },
    isVerified: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
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
      type: Sequelize.DATE,
      paranoid: true
    },
    userId: {
      type: Sequelize.STRING,
      onDelete: 'set null',
      allowNull: false,
      references: {
        model: 'Users',
        key: 'userId',
        as: 'users',
      },
    },
  }),
  down: queryInterface => queryInterface.dropTable('TravelReadinessDocuments',
    { cascade: true, force: true })
};
