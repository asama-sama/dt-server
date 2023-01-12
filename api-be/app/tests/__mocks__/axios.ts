/// <reference types="@types/jest" />;
module.exports = {
  get: jest.fn(() => "data"),
  post: jest.fn(() => ({ data: "data" })),
};
