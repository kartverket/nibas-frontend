import { render, screen, waitFor } from "test/test-utils";
import { ReactNode } from "react";
import GrunnkretsPanel from "./GrunnkretsPanel";
import { GrunnkretsRequest } from "types/api";
import { InndelingerKretsProvider } from "contexts/InndelingerKretsContext";

const defaultProps: React.ComponentProps<typeof GrunnkretsPanel> = {
  isOpen: true,
  onClose: jest.fn(),
};

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
        getUpdateUtkastRequestFromHistory: jest.fn(),
        updateUtkast: jest.fn(),
        updateUtkastWithHistory: jest.fn(),
        closeUtkast: jest.fn(),
        isValidating: false,
      },
    }
  );

describe("GrunnkretsPanel", () => {
  it("should render kommunes grunnkretser in table", async () => {
    renderWithProvider(<GrunnkretsPanel {...defaultProps} />);

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
    renderWithProvider(<GrunnkretsPanel {...defaultProps} />, {
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
    const { user } = renderWithProvider(<GrunnkretsPanel {...defaultProps} />);

    await user.click(
      screen.getByRole("button", {
        name: /vis fremtidige endringer for mosekollen øst/i,
      })
    );

    await waitFor(() => expect(screen.getAllByRole("table")).toHaveLength(2));

    await user.click(
      screen.getByRole("button", {
        name: /skjul fremtidige endringer for mosekollen øst/i,
      })
    );

    expect(screen.getAllByRole("table")).toHaveLength(1);
  });
});
