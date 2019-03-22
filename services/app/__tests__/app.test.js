import request from 'supertest';
import faker from 'faker';
import app from '..';
import db from '../models';
// import { user1, user2, user3 } from './__fixtures__/users';

const user1 = {
  email: faker.internet.email(),
  password: faker.internet.password(),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
};
const user2 = {
  email: faker.internet.email(),
  password: faker.internet.password(),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
};
const user3 = {
  email: faker.internet.email(),
  password: faker.internet.password(),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
};


describe('requests', () => {
  let server;
  beforeEach(async () => {
    server = app().listen();
    await db.sequelize.sync({ force: true });
  });
  afterEach((done) => {
    server.close();
    done();
  });

  it('GET 200', async () => {
    await request.agent(server).get('/').expect(200);
  });

  it('GET 404', async () => {
    await request.agent(server).get('/wrong-path').expect(404);
  });

  it('GET /Users', async () => {
    await request.agent(server).get('/users').expect(200);
  });
});

describe('autentification', () => {
  let server;
  beforeEach(async () => {
    server = app().listen();
    await db.sequelize.sync({ force: true });
  });
  afterEach((done) => {
    server.close();
    done();
  });

  it('signIn', async () => {
    await request.agent(server).post('/users').send({ form: user1 }).expect(302);
    await request.agent(server).get('/session/new').expect(200);
    await request.agent(server).post('/session').send({ form: user1 }).expect(302);
  });
  it('signOut', async () => {
    await request.agent(server).post('/users').send({ form: user1 }).expect(302);
    await request.agent(server).get('/session/new').expect(200);
    await request.agent(server).post('/session').send({ form: user1 }).expect(302);
    await request.agent(server).delete('/session').expect(302);
  });
});

describe('users CRUD', () => {
  let server;
  beforeEach(async () => {
    server = app().listen();
    await db.sequelize.sync({ force: true });
  });
  afterEach((done) => {
    server.close();
    done();
  });

  it('Create user test', async () => {
    await request.agent(server).post('/users').send({ form: user1 }).expect(302);
    const { email, firstName } = user1;
    const user = await db.User.findOne({ where: { email } });
    expect(user.firstName).toBe(firstName);
  });
  it('Create many users', async () => {
    await request.agent(server).post('/users').send({ form: user1 }).expect(302);
    await request.agent(server).post('/users').send({ form: user2 }).expect(302);
    await request.agent(server).post('/users').send({ form: user3 }).expect(302);
    const users = await db.User.findAll();
    expect(users).toHaveLength(3);
  });
  it('Update user', async () => {
    await request.agent(server).post('/users').send({ form: user1 }).expect(302);
    const { email } = user1;
    const user = await db.User.findOne({ where: { email } });
    await request.agent(server).patch(`/users/${user.id}/edit`).send({ form: { firstName: user2.firstName } }).expect(200);
    const userUpdate = await db.User.findOne({ where: { email } });
    const { firstName } = user2;
    expect(userUpdate.firstName).toBe(firstName);
  });
  it('Delete user', async () => {
    await request.agent(server).post('/users').send({ form: user1 }).expect(302);
    const { email } = user1;
    const user = await db.User.findOne({ where: { email } });
    await request.agent(server).delete(`/users/${user.id}`).expect(302);
  });
});
