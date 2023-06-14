import { render, screen } from "test/test-utils";
import { ReactNode } from "react";
import Bakgrunnskart from "./Bakgrunnskart";
import { SidebarPanel } from "contexts/SidebarPanelContext";

const renderWithProvider = (
  ui: ReactNode,
  activeSidebarPanel: SidebarPanel | null = "kartlag"
) =>
  render(ui, {
    SidebarPanelProvider: {
      activeSidebarPanel,
      openSidebarPanel: vi.fn(),
      closeSidebarPanel: vi.fn(),
    },
    BakgrunnskartProvider: true,
  });

describe("Bakgrunnskart", () => {
  it("should not render when not visible", () => {
    renderWithProvider(<Bakgrunnskart />, null);

    expect(
      screen.queryByRole("heading", { name: /sidebar.kartlag/i })
    ).not.toBeInTheDocument();
  });

  it("should add sublayer to list on plus click", async () => {
    const { user } = renderWithProvider(<Bakgrunnskart />);

    const openMainButton = await screen.findByRole("button", {
      name: /Administrative enheter WMS versjon 2 åpne/i,
    });
    await user.click(openMainButton);

    const openSubButton = await screen.findByRole("button", {
      name: /Kommuner åpne/i,
    });
    await user.click(openSubButton);

    const addButton = await screen.findByRole("button", {
      name: /vis Kommuner historisk/i,
    });
    await user.click(addButton);

    let mainLayerTexts = screen.getAllByText(
      "Administrative enheter WMS versjon 2"
    );
    const subLayerTexts = screen.getAllByText("Kommuner");
    let subsubLayerTexts = screen.getAllByText("Kommuner historisk");

    expect(mainLayerTexts).toHaveLength(2);
    expect(subLayerTexts).toHaveLength(1);
    expect(subsubLayerTexts).toHaveLength(2);

    const removeButton = await screen.getAllByRole("button", {
      name: /Fjern Kommuner historisk/i,
    })[0];

    await user.click(removeButton);

    mainLayerTexts = screen.getAllByText(
      "Administrative enheter WMS versjon 2"
    );
    subsubLayerTexts = screen.getAllByText("Kommuner historisk");

    expect(mainLayerTexts).toHaveLength(1);
    expect(subsubLayerTexts).toHaveLength(1);
  });

  it("should add two sublayers to aktive kartlag", async () => {
    const { user } = renderWithProvider(<Bakgrunnskart />);

    const openMainButton = await screen.findByRole("button", {
      name: /Administrative enheter WMS versjon 2 åpne/i,
    });
    await user.click(openMainButton);

    const openSubButton = await screen.findByRole("button", {
      name: /Kommuner åpne/i,
    });
    await user.click(openSubButton);

    const addButton = await screen.findByRole("button", {
      name: /Vis Kommuner historisk/i,
    });
    await user.click(addButton);

    await user.click(
      screen.getByRole("button", {
        name: /Vis Kommuner gjeldene/i,
      })
    );

    await user.click(
      screen.getByRole("button", {
        name: /vis Kommuner framtidig/i,
      })
    );

    expect(screen.getAllByText("Kommuner historisk")).toHaveLength(2);
    expect(screen.getAllByText("Kommuner gjeldene")).toHaveLength(2);
    expect(screen.getAllByText("Kommuner framtidig")).toHaveLength(2);

    await user.click(
      screen.getAllByRole("button", {
        name: /Fjern Kommuner historisk/i,
      })[0]
    );
    await user.click(
      screen.getAllByRole("button", {
        name: /Fjern Kommuner gjeldene/i,
      })[0]
    );
    await user.click(
      screen.getAllByRole("button", {
        name: /Fjern Kommuner framtidig/i,
      })[0]
    );

    expect(screen.getAllByText("Kommuner historisk")).toHaveLength(1);
    expect(screen.getAllByText("Kommuner gjeldene")).toHaveLength(1);
    expect(screen.getAllByText("Kommuner framtidig")).toHaveLength(1);
  });
});
