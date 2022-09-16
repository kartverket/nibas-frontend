import { render, screen, waitFor } from "test/test-utils";
import { ReactNode } from "react";
import GrunnkretserPanel from "./GrunnkretserPanel";
import { UtkastContext } from "contexts/UtkastContext";
import { mockKommuner } from "mocks/handlers/responses";
import { GrunnkretsRequest } from "types/api";

const renderWithProvider = (
  ui: ReactNode,
  data: Record<string, GrunnkretsRequest> = {}
) =>
  render(
    <UtkastContext.Provider
      value={{
        utkast: {
          grunnkretser: data,
        },
      }}
    >
      {ui}
    </UtkastContext.Provider>
  );

const defaultProps: React.ComponentProps<typeof GrunnkretserPanel> = {
  kommune: mockKommuner[0],
};

describe("GrunnkretserPanel", () => {
  it("should render kommunes grunnkretser in table", async () => {
    renderWithProvider(<GrunnkretserPanel {...defaultProps} />);

    expect(await screen.findByRole("table")).toBeInTheDocument();

    await waitFor(() => {
      // 2 grunnkretser + 1 header row
      expect(screen.getAllByRole("row")).toHaveLength(3);
    });
    expect(
      await screen.findByRole("cell", { name: /mosekollen øst/i })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("cell", { name: /12345678/i })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("cell", { name: /dåsvatn/i })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("cell", { name: /12345679/i })
    ).toBeInTheDocument();
  });

  it("should apply utkast correctly", async () => {
    renderWithProvider(<GrunnkretserPanel {...defaultProps} />, {
      "1": {
        grunnkretsnummer: "87654321",
        navn: "Mosekollen vest",
        identifikasjon: {
          lokalid: "lokalid",
          navnerom: "navnerom",
          versjonid: "versjonId",
        },
      },
    });

    expect(
      await screen.findByRole("cell", { name: /mosekollen vest/i })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("cell", { name: /87654321/i })
    ).toBeInTheDocument();
  });
});
