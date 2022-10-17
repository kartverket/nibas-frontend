import { render, screen } from "test/test-utils";
import { ReactNode } from "react";
import Bakgrunnskart from "./Bakgrunnskart";

const renderWithProvider = (ui: ReactNode, visible = true) =>
  render(ui, {
    SidebarPanelProvider: {
      openPanels: {
        inndelinger: false,
        kartlag: visible,
        soek: false,
        utkast: false,
      },
      setPanel: jest.fn(),
      togglePanel: jest.fn(),
    },
    BakgrunnskartProvider: true,
  });

describe("Bakgrunnskart", () => {
  it("should not render when not visible", () => {
    renderWithProvider(<Bakgrunnskart />, false);

    expect(
      screen.queryByRole("heading", { name: /sidebar.kartlag/i })
    ).not.toBeInTheDocument();
  });

  it("should open bakgrunnskart panel on bakgrunsskart button click", async () => {
    const { user } = renderWithProvider(<Bakgrunnskart />);

    const bakgrunnskartButton = screen.getByRole("button", {
      name: /sidebar.kartlag/i,
    });
    await user.click(bakgrunnskartButton);

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
    const { user } = renderWithProvider(<Bakgrunnskart />);

    const bakgrunnskartButton = screen.getByRole("button", {
      name: /sidebar.kartlag/i,
    });
    await user.click(bakgrunnskartButton);

    const showLayerButton = await screen.findByRole(
      "button",
      {
        name: /vis Administrative enheter WMS versjon 2/i,
      },
      {
        timeout: 3000,
      }
    );
    await user.click(showLayerButton);

    const hideLayerButton = await screen.findByRole("button", {
      name: /skjul Administrative enheter WMS versjon 2/i,
    });
    await user.click(hideLayerButton);

    expect(showLayerButton).toBeInTheDocument();
  });

  it("should toggle visibility of WMTS layer on eye click", async () => {
    const { user } = renderWithProvider(<Bakgrunnskart />);

    const bakgrunnskartButton = screen.getByRole("button", {
      name: /sidebar.kartlag/i,
    });
    await user.click(bakgrunnskartButton);

    const showLayerButton = await screen.findByRole(
      "button",
      {
        name: /vis Nibcache_UTM33_EUREF89_v2/i,
      },
      { timeout: 3000 }
    );
    await user.click(showLayerButton);

    const hideLayerButton = await screen.findByRole("button", {
      name: /skjul Nibcache_UTM33_EUREF89_v2/i,
    });
    await user.click(hideLayerButton);

    expect(showLayerButton).toBeInTheDocument();
  });
});
