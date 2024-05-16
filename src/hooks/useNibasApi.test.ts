import { paths } from "types/api-gen";
import { describe, it } from "vitest";
import { getUrlWithParameters } from "./useNibasApi";

describe("getUrlWithParams", () => {
  it("skal lage komplett url ut fra baseurl og parametere", () => {
    type TestPaths = Pick<paths, "/v1/kommuner/{id}" | "/v1/fylker/{id}">;

    const idTest = getUrlWithParameters<keyof TestPaths>("/v1/kommuner/{id}", {
      id: "1",
    });
    const idQueryTest = getUrlWithParameters<keyof TestPaths>("/v1/fylker/{id}", {
      id: "2",
      gyldighetsdato: "1998-08-07",
    });

    expect(idTest).toEqual("/v1/kommuner/1");
    expect(idQueryTest).toEqual("/v1/fylker/2?gyldighetsdato=1998-08-07");
  });
});
