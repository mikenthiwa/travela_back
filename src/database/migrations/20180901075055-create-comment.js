module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Comments', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.STRING,
    },
    comment: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    isEdited: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    requestId: {
      type: Sequelize.STRING,
      references: {
        model: 'Requests',
        key: 'id',
        as: 'requestId',
      },
      allowNull: false,
    },
    userName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    userEmail: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    picture: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    deletedAt: {
      type: Sequelize.DATE,
      allowNull: true,
    }
  }),
  down: queryInterface => queryInterface.dropTable('Comments'),
};
