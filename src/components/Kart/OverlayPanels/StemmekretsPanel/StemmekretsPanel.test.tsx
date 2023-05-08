import { render, screen, waitFor } from "test/test-utils";
import React, { ReactNode } from "react";
import StemmekretsPanel from "./StemmekretsPanel";
import { StemmekretsRequest } from "types/api";
import { InndelingerKretsProvider } from "contexts/InndelingerKretsContext";

const defaultProps: React.ComponentProps<typeof StemmekretsPanel> = {
  isOpen: true,
  onClose: jest.fn(),
};

const renderWithProvider = (
  ui: ReactNode,
  utkastData: Record<string, StemmekretsRequest> = {}
) =>
  render(
    <InndelingerKretsProvider kretstype={"stemmekrets"}>
      {ui}
    </InndelingerKretsProvider>,
    {
      UtkastProvider: {
        utkast: {
          operasjoner: {
            metadataendringer: {
              stemmekretsendringer: utkastData,
            },
          },
        } as any, // ikke interessert i andre felter
        updateUtkastWithHistory: jest.fn(),
        getUpdateUtkastRequestFromHistory: jest.fn(),
        updateUtkast: jest.fn(),
        closeUtkast: jest.fn(),
        isValidating: false,
      },
    }
  );

describe("StemmekretsPanel", () => {
  it("should render kommunes stemmekretser in table", async () => {
    renderWithProvider(<StemmekretsPanel {...defaultProps} />);

    expect(await screen.findByRole("table")).toBeInTheDocument();

    await waitFor(() => {
      // 2 stemmekretser + 1 header row
      expect(screen.getAllByRole("row")).toHaveLength(3);
    });
    expect(
      await screen.findByRole("cell", { name: "Slemfjord" })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("cell", { name: /12/i })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("cell", { name: /16/i })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("cell", { name: /tellekretsnr1/i })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("cell", { name: /tellekretsnavn1/i })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("cell", { name: "Undredal" })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("cell", { name: /05/i })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("cell", { name: /14/i })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("cell", { name: /tellekretsnr2/i })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("cell", { name: /tellekretsnavn2/i })
    ).toBeInTheDocument();
  });

  it("should not render editrow when accordion is closed", async () => {
    renderWithProvider(<StemmekretsPanel {...defaultProps} />);

    expect(await screen.findAllByRole("cell")).toHaveLength(14); // 2x 7 celler
  });

  it("should render EditRow on Caret toggle", async () => {
    const { user } = renderWithProvider(<StemmekretsPanel {...defaultProps} />);

    await user.click(
      (
        await screen.findAllByRole("button", {
          name: /Åpne redigering av Slemfjord/i,
        })
      )[0]
    );

    expect(await screen.findAllByRole("cell")).toHaveLength(15); // 2x 7 celler + 1 editrow
  });

  it("should render with utkast applied", async () => {
    renderWithProvider(<StemmekretsPanel {...defaultProps} />, {
      "1": {
        stemmekretsnavn: "To-hundredal",
        stemmekretsnummer: "05",
        identifikasjon: {
          lokalid: "1",
        },
        kommunenummer: "c416fb1d-2124-4f71-8dfc-859c55feb437",
        tellekretsnummer: "Nytt tellekretsnummer",
        tellekretsnavn: "tellekretsnavn1",
        valgdistriktsnummer: "14",
        version: 1,
      },
    });

    expect(
      await screen.findByRole("cell", { name: "To-hundredal" })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("cell", { name: /nytt tellekretsnummer/i })
    ).toBeInTheDocument();
  });

  // må få ferdig API-endepunkt først
  it.skip("should toggle future changes table when clicking future changes icon", async () => {
    const { user } = renderWithProvider(<StemmekretsPanel {...defaultProps} />);

    await user.click(
      screen.getByRole("button", {
        name: /vis fremtidige endringer for slemfjord/i,
      })
    );

    await waitFor(() => expect(screen.getAllByRole("table")).toHaveLength(2));

    await user.click(
      screen.getByRole("button", {
        name: /skjul fremtidige endringer for slemfjord/i,
      })
    );

    expect(screen.getAllByRole("table")).toHaveLength(1);
  });
});
