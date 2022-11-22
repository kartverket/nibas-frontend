import { render, screen, waitFor } from "test/test-utils";
import { ReactNode } from "react";
import GrunnkretserPanel from "./GrunnkretserPanel";
import { mockKommuner } from "mocks/handlers/responses";
import { GrunnkretsRequest } from "types/api";
import { InndelingerKretsProvider } from "contexts/InndelingerKretsContext";

const renderWithProvider = (
  ui: ReactNode,
  data: Record<string, GrunnkretsRequest> = {}
) =>
  render(
    <InndelingerKretsProvider kretstype={"grunnkrets"}>
      {ui}
    </InndelingerKretsProvider>,
    {
      UtkastProvider: {
        utkast: {
          operasjoner: {
            metadataendringer: {
              grunnkretsendringer: data,
            },
          },
        } as any, // ikke interessert i andre felter
        updateUtkastWithHistory: jest.fn(),
        closeUtkast: jest.fn(),
      },
    }
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
        version: 1,
        identifikasjon: {
          lokalid: "lokalid",
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

  it("should toggle future changes table when clicking future changes icon", async () => {
    const { user } = renderWithProvider(
      <GrunnkretserPanel {...defaultProps} />
    );

    await user.click(
      screen.getByRole("button", {
        name: /vis fremtidige endringer for mosekollen øst/i,
      })
    );

    expect(screen.getAllByRole("table")).toHaveLength(2);

    await user.click(
      screen.getByRole("button", {
        name: /skjul fremtidige endringer for mosekollen øst/i,
      })
    );

    expect(screen.getAllByRole("table")).toHaveLength(1);
  });
});
