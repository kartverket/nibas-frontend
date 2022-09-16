import { render, screen } from "test/test-utils";
import { ReactNode } from "react";
import userEvent from "@testing-library/user-event";
import FylkeList from "./FylkeList";
import { EditGrenserProvider } from "contexts/EditGrenserContext";
import { UtkastContext } from "contexts/UtkastContext";

const renderWithProvider = (ui: ReactNode) =>
  render(
    <EditGrenserProvider>
      <UtkastContext.Provider value={{ utkast: {} }}>
        {ui}
      </UtkastContext.Provider>
    </EditGrenserProvider>
  );

describe("FylkeList", () => {
  it("should render two names from fylker", async () => {
    renderWithProvider(<FylkeList />);

    expect(await screen.findByText("Vestfold og Telemark")).toBeInTheDocument();
    expect(await screen.findByText("Agder")).toBeInTheDocument();
  });

  it("should open eye on eye click", async () => {
    renderWithProvider(<FylkeList />);

    const closedEyes = await screen.findAllByRole("button", {
      name: "Usynlig",
    });
    const openEyesBeforeClick = screen.queryAllByRole("button", {
      name: "Synlig",
    });

    userEvent.click(closedEyes[0]);

    const openEye = screen.getByRole("button", { name: "Synlig" });
    expect(openEye).toBeInTheDocument();
    expect(openEyesBeforeClick).toHaveLength(0);
  });

  it("should open eye and check checkbox on checkbox click", async () => {
    renderWithProvider(<FylkeList />);

    const checkbox = await screen.findByRole("checkbox", {
      name: /agder/i,
    });
    userEvent.click(checkbox);

    expect(checkbox).toBeChecked();
    expect(screen.getByRole("button", { name: "Synlig" })).toBeInTheDocument();
  });

  it("should close both eye and uncheck checkbox when checkbox is checked", async () => {
    renderWithProvider(<FylkeList />);

    const checkbox = await screen.findByRole("checkbox", {
      name: /agder/i,
    });
    userEvent.click(checkbox);
    userEvent.click(checkbox);

    expect(checkbox).not.toBeChecked();
    expect(
      screen.queryByRole("button", { name: "Synlig" })
    ).not.toBeInTheDocument();
  });
});
