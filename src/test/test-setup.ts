import "mocks/globals";
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";
import { server } from "../mocks/server";

// extends Vitest's expect method with methods from react-testing-library
declare module "vitest" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Assertion<T = any> extends jest.Matchers<void, T>, TestingLibraryMatchers<T, void> {}
}

beforeAll(() => {
  // Establish API mocking before all tests.
  server.listen();
});

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

afterAll(() => {
  server.close();
});
