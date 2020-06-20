module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Documents', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.STRING
    },
    name: {
      allowNull: false,
      type: Sequelize.STRING
    },
    cloudinary_public_id: {
      allowNull: false,
      type: Sequelize.STRING
    },
    cloudinary_url: {
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
    },
    deletedAt: {
      allowNull: true,
      type: Sequelize.DATE
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
  down: queryInterface => queryInterface.dropTable('Documents')
};
