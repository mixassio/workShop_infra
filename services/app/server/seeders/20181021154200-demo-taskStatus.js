
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert('TaskStatuses', // eslint-disable-line no-unused-vars
    [
      {
        name: 'new',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'in work',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'testing',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'finished',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {}),
  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('TaskStatuses', null, {}), // eslint-disable-line no-unused-vars
};
