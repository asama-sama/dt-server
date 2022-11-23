/// <reference types="@types/jest" />;
import request from "supertest";
import { app } from "../../src/app";

describe("suburbs api", () => {
  test("it should throw an error if suburbIds is empty", async () => {
    const response = await request(app).get("/suburbs");
    expect(response.status).toBe(400);
    expect(response.text).toBe("suburbIds cannot be empty");
  });

  test("it should throw an error if suburbIds is not an array", async () => {
    const response = await request(app).get("/suburbs?suburbIds=test");
    expect(response.status).toBe(400);
    expect(response.text).toBe("suburbIds must be an array");
  });

  test("it should throw an error if suburbIds is an empty array", async () => {
    const response = await request(app).get("/suburbs?suburbIds[]=test");
    expect(response.status).toBe(400);
    expect(response.text).toBe("suburbIds must be numbers");
  });
});
