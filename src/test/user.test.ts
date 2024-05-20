import { Server } from 'http';
import request from "supertest";
import { initTestApp } from '../utils.js';

let app: Server;


beforeAll(async () => {
  app = await initTestApp(3000);
});

afterAll(async () => {

});

describe("POST /api/user/signup", () => {
  it("should signup new user ", async () => {
    const res = await request(app).post(
      "/api/user/signup"
    ).send({
      "username": "test",
      "email": "test@gmail.com",
      "password": "1234"
  });
    expect(res.statusCode).toBe(200);
  });
});