import { render, screen } from "test/test-utils";
import { ReactNode } from "react";
import userEvent from "@testing-library/user-event";
import Bakgrunnskart from "./Bakgrunnskart";
import { BakgrunnskartProvider } from "contexts/BakgrunnskartContext";
import { SidebarPanelContext } from "contexts/SidebarPanelContext";

const renderWithProvider = (ui: ReactNode, visible = true) =>
  render(
    <SidebarPanelContext.Provider
      value={{
        openPanels: {
          inndelinger: false,
          kartlag: visible,
          soek: false,
          utkast: false,
        },
        setPanel: jest.fn(),
        togglePanel: jest.fn(),
      }}
    >
      <BakgrunnskartProvider>{ui}</BakgrunnskartProvider>
    </SidebarPanelContext.Provider>
  );

describe("Bakgrunnskart", () => {
  it("should not render when not visible", () => {
    renderWithProvider(<Bakgrunnskart />, false);

    expect(
      screen.queryByRole("heading", { name: /sidebar.kartlag/i })
    ).not.toBeInTheDocument();
  });

  it("should open bakgrunnskart panel on bakgrunsskart button click", async () => {
    renderWithProvider(<Bakgrunnskart />);

    const bakgrunnskartButton = screen.getByRole("button", {
      name: /sidebar.kartlag/i,
    });
    userEvent.click(bakgrunnskartButton);

    expect(
      screen.getByRole("heading", { name: /sidebar.kartlag/i })
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        "Administrative enheter WMS versjon 2",
        undefined,
        { timeout: 3000 }
      )
    ).toBeInTheDocument();
  });

  it("should toggle visibility of WMS layer on eye click", async () => {
    renderWithProvider(<Bakgrunnskart />);

    const bakgrunnskartButton = screen.getByRole("button", {
      name: /sidebar.kartlag/i,
    });
    userEvent.click(bakgrunnskartButton);

    const showLayerButton = await screen.findByRole(
      "button",
      {
        name: /vis Administrative enheter WMS versjon 2/i,
      },
      {
        timeout: 3000,
      }
    );
    userEvent.click(showLayerButton);

    const hideLayerButton = await screen.findByRole("button", {
      name: /skjul Administrative enheter WMS versjon 2/i,
    });
    userEvent.click(hideLayerButton);

    expect(showLayerButton).toBeInTheDocument();
  });

  it("should toggle visibility of WMTS layer on eye click", async () => {
    renderWithProvider(<Bakgrunnskart />);

    const bakgrunnskartButton = screen.getByRole("button", {
      name: /sidebar.kartlag/i,
    });
    userEvent.click(bakgrunnskartButton);

    const showLayerButton = await screen.findByRole(
      "button",
      {
        name: /vis Nibcache_UTM33_EUREF89_v2/i,
      },
      { timeout: 3000 }
    );
    userEvent.click(showLayerButton);

    const hideLayerButton = await screen.findByRole("button", {
      name: /skjul Nibcache_UTM33_EUREF89_v2/i,
    });
    userEvent.click(hideLayerButton);

    expect(showLayerButton).toBeInTheDocument();
  });
});
