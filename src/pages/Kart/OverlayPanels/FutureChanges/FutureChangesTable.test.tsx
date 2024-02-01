import { mockGrunnkrets1 } from "mocks/handlers/responses";
import { render, screen } from "test/test-utils";
import { GrunnkretsResponse } from "types/api";
import FutureChangesTable, { TableRow } from "./FutureChangesTable";

const defaultProps: React.ComponentProps<typeof FutureChangesTable<GrunnkretsResponse>> = {
  id: mockGrunnkrets1.id.lokalid.value,
  futureChangesUrl: "/v1/grunnkretser/{lokalid}/framtidigeversjoner",
  headers: ["Navn", "Grunnkretsnummer", "Oppdatert", "Type", "Gyldig fra", "Gyldig til"],
  getRows: (futureChanges: GrunnkretsResponse[]) => {
    return futureChanges.map(
      (futureChange) =>
        ({
          id: "1",
          cells: [
            futureChange.navn,
            futureChange.grunnkretsnummer,
            futureChange.oppdateringsdato,
            futureChange.endringstype,
            futureChange.gyldighet.gyldigFra,
            futureChange.gyldighet.gyldigTil,
          ],
        }) as TableRow,
    );
  },
};

describe("FutureChangesTable", () => {
  // fiks etter https://kartverket.atlassian.net/browse/TS-573
  it("should list all future changes for a grunnkrets", async () => {
    render(<FutureChangesTable {...defaultProps} />);

    expect(await screen.findByRole("table")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(4); // header, current row, 2 future changes

    expect(await screen.findByRole("cell", { name: "Mosekollen øst" })).toBeInTheDocument();
    expect(await screen.findByRole("cell", { name: "12345678" })).toBeInTheDocument();

    expect(await screen.findByRole("cell", { name: "Mosekollen vest" })).toBeInTheDocument();
    expect(await screen.findByRole("cell", { name: "12345679" })).toBeInTheDocument();

    expect(await screen.findByRole("cell", { name: "Mosekollen nord" })).toBeInTheDocument();
    expect(await screen.findByRole("cell", { name: "87654321" })).toBeInTheDocument();
  });
});
