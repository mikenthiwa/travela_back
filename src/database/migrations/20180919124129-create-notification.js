
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable(
    'Notifications', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      senderId: {
        allowNull: false,
        type: Sequelize.STRING
      },
      recipientId: {
        allowNull: false,
        type: Sequelize.STRING
      },
      notificationType: {
        allowNull: false,
        type: Sequelize.STRING
      },
      senderName: {
        allowNull: false,
        type: Sequelize.STRING
      },
      notificationStatus: {
        allowNull: false,
        type: Sequelize.STRING
      },
      notificationLink: {
        allowNull: false,
        type: Sequelize.STRING
      },
      senderImage: {
        allowNull: false,
        type: Sequelize.STRING
      },
      message: {
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
    }
  ),
  down: queryInterface => queryInterface.dropTable('Notifications')
};
