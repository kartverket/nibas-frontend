import { mockGrunnkrets1 } from "mocks/handlers/responses";
import { render, screen } from "test/test-utils";
import { GrunnkretsResponse } from "types/api";
import FutureChangesTable from "./FutureChangesTable";

const defaultProps: React.ComponentProps<typeof FutureChangesTable> = {
  id: "1",
  futureChangesUrl: "/v1/grunnkretser/{id}",
  headers: [
    "Navn",
    "Grunnkretsnummer",
    "Oppdatert",
    "Type",
    "Gyldig fra",
    "Gyldig til",
  ],
  getRows: (futureChanges: any[]) => {
    return futureChanges.map((futureChange) => {
      return {
        id: "1",
        cells: [
          futureChange.navn,
          futureChange.grunnkretsnummer,
          (futureChange as any).oppdatert,
          (futureChange as any).type,
          (futureChange as any).gyldigFra,
          (futureChange as any).gyldigTil,
        ],
      };
    });
  },
};

describe("FutureChangesTable", () => {
  // fiks etter https://kartverket.atlassian.net/browse/TS-573
  it.skip("should list all future changes for a grunnkrets", async () => {
    render(<FutureChangesTable {...defaultProps} />);

    expect(await screen.findByRole("table")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(4); // header, current row, 2 future changes

    expect(
      await screen.findByRole("cell", { name: /mosekollen øst/i })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("cell", { name: /12345678/i })
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("cell", { name: /mosekollen vest/i })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("cell", { name: /12345679/i })
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("cell", { name: /mosekollen nord/i })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("cell", { name: /87654321/i })
    ).toBeInTheDocument();
  });
});
