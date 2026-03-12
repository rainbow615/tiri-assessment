const request = require('supertest');
const express = require('express');

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
  },
}));

const fs = require('fs');
const itemsRouter = require('../src/routes/items');
const { errorHandler } = require('../src/middleware/errorHandler');

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/items', itemsRouter);
  app.use(errorHandler);
  return app;
}

const mockItems = [
  { id: 1, name: 'Apple', price: 1 },
  { id: 2, name: 'Banana', price: 2 },
  { id: 3, name: 'Cherry', price: 3 },
];

describe('Items routes', () => {
  beforeEach(() => {
    fs.promises.readFile.mockReset();
    fs.promises.writeFile.mockReset();
  });

  test('GET /api/items returns paginated items with metadata (happy path)', async () => {
    fs.promises.readFile.mockResolvedValue(JSON.stringify(mockItems));
    const app = createApp();

    const res = await request(app).get('/api/items').expect(200);

    expect(res.body.items).toEqual(mockItems.slice(0, 20));
    expect(res.body.total).toBe(3);
    expect(res.body.page).toBe(1);
    expect(res.body.totalPages).toBe(1);
    expect(res.body.pageSize).toBe(20);
    expect(fs.promises.readFile).toHaveBeenCalledTimes(1);
  });

  test('GET /api/items supports search query "q" (server-side search)', async () => {
    fs.promises.readFile.mockResolvedValue(JSON.stringify(mockItems));
    const app = createApp();

    const res = await request(app)
      .get('/api/items')
      .query({ q: 'app' })
      .expect(200);

    expect(res.body.items).toEqual([mockItems[0]]);
    expect(res.body.total).toBe(1);
  });

  test('GET /api/items supports page and limit query for pagination', async () => {
    fs.promises.readFile.mockResolvedValue(JSON.stringify(mockItems));
    const app = createApp();

    const res = await request(app)
      .get('/api/items')
      .query({ limit: 2, page: 2 })
      .expect(200);

    expect(res.body.items).toEqual([mockItems[2]]);
    expect(res.body.total).toBe(3);
    expect(res.body.page).toBe(2);
    expect(res.body.totalPages).toBe(2);
    expect(res.body.pageSize).toBe(2);
  });

  test('GET /api/items propagates read errors to error handler', async () => {
    fs.promises.readFile.mockRejectedValue(new Error('Failed to read'));
    const app = createApp();

    const res = await request(app).get('/api/items').expect(500);

    expect(res.body).toEqual({ message: 'Failed to read' });
  });

  test('GET /api/items/:id returns item when found', async () => {
    fs.promises.readFile.mockResolvedValue(JSON.stringify(mockItems));
    const app = createApp();

    const res = await request(app).get('/api/items/1').expect(200);

    expect(res.body).toEqual(mockItems[0]);
  });

  test('GET /api/items/:id returns 404 when not found', async () => {
    fs.promises.readFile.mockResolvedValue(JSON.stringify(mockItems));
    const app = createApp();

    const res = await request(app).get('/api/items/999').expect(404);

    expect(res.body).toEqual({ message: 'Item not found' });
  });

  test('POST /api/items creates a new item (happy path)', async () => {
    fs.promises.readFile.mockResolvedValue(JSON.stringify(mockItems));
    fs.promises.writeFile.mockResolvedValue();

    const app = createApp();

    const payload = { name: 'Cherry', price: 3 };

    const res = await request(app)
      .post('/api/items')
      .send(payload)
      .expect(201);

    expect(res.body.name).toBe('Cherry');
    expect(res.body.price).toBe(3);
    expect(typeof res.body.id).toBe('number');
    expect(fs.promises.writeFile).toHaveBeenCalledTimes(1);
  });

  test('POST /api/items propagates write errors to error handler', async () => {
    fs.promises.readFile.mockResolvedValue(JSON.stringify(mockItems));
    fs.promises.writeFile.mockRejectedValue(new Error('Failed to write'));

    const app = createApp();

    const res = await request(app)
      .post('/api/items')
      .send({ name: 'Cherry', price: 3 })
      .expect(500);

    expect(res.body).toEqual({ message: 'Failed to write' });
  });
});
