import { server } from "./mocks/server";
import "@testing-library/jest-dom";
import { initBakgrunnskartLayers, initGrenserLayers } from "utils/map/layers";

beforeAll(() => {
  // Establish API mocking before all tests.
  server.listen();

  // Sett inn lag før testene starter
  // Dette gjøres egentlig i <Kart />, men underliggende komponenter
  // har ikke fått de initialisert enda
  initGrenserLayers();
  initBakgrunnskartLayers();
});
// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());
// Clean up after the tests are finished.
afterAll(() => server.close());
