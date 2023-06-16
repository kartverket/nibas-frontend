import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import matchers, {
  TestingLibraryMatchers,
} from "@testing-library/jest-dom/matchers";
import { server } from "../mocks/server";
import { initBakgrunnskartLayers, initGrenserLayers } from "utils/map/layers";

// extends Vitest's expect method with methods from react-testing-library
declare module "vitest" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Assertion<T = any>
    extends jest.Matchers<void, T>,
      TestingLibraryMatchers<T, void> {}
}
expect.extend(matchers);

beforeAll(() => {
  // Establish API mocking before all tests.
  server.listen();

  // Sett inn lag før testene starter
  // Dette gjøres egentlig i <Kart />, men underliggende komponenter
  // har ikke fått de initialisert enda
  initGrenserLayers();
  initBakgrunnskartLayers();
});

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

afterAll(() => {
  server.close();
});
