import * as kommunerApi from "../kommuner";
import { MockedModule } from "test/types";

const mock = jest.createMockFromModule("../kommuner") as MockedModule<
  typeof kommunerApi
>;

mock.fetchKommunerByFylke.mockResolvedValue([
  { type: "KOMMUNE", id: 1, navn: "Ringerike", nummer: "3007" },
  { type: "KOMMUNE", id: 2, navn: "Hole", nummer: "3038" },
]);

module.exports = mock;
