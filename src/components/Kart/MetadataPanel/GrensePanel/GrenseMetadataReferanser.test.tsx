import { render, screen, within } from "test/test-utils";
import { ReactNode } from "react";
import userEvent from "@testing-library/user-event";
import GrenseMetadataReferanser from "./GrenseMetadataReferanser";
import { EditGrenserProvider } from "contexts/EditGrenserContext";
import { mockBasicFeature } from "mocks/handlers/responses";

const defaultProps: React.ComponentProps<typeof GrenseMetadataReferanser> = {
  feature: mockBasicFeature,
};

const renderWithProvider = (ui: ReactNode) =>
  render(<EditGrenserProvider>{ui}</EditGrenserProvider>);

const testFieldArray = (groupName: string | RegExp) => {
  renderWithProvider(<GrenseMetadataReferanser {...defaultProps} />);

  const group = screen.getByRole("group", {
    name: groupName,
  });
  const newUrlInput = within(group).getByRole("textbox", {
    name: /ny {{ item }}/i,
  });
  userEvent.type(newUrlInput, "Ny lenke{enter}");

  const addButton = within(group).getByRole("button", {
    name: /legg til/i,
  });
  userEvent.type(newUrlInput, "Lenke uten enter");
  userEvent.click(addButton);

  expect(screen.getByRole("link", { name: /ny lenke/i })).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: /lenke uten enter/i })
  ).toBeInTheDocument();
};

describe("GrenseMetadataReferanser", () => {
  it("should display data from feature properties", async () => {
    renderWithProvider(<GrenseMetadataReferanser {...defaultProps} />);

    expect(screen.getByRole("textbox", { name: /Rettskilde-ID/i })).toHaveValue(
      "RID"
    );
    expect(
      screen.getByRole("textbox", { name: /Fastsettingsmyndighet/i })
    ).toHaveValue("Fastsettingsmyndighet");
    expect(screen.getByRole("textbox", { name: /Hjemmel/i })).toHaveValue(
      "Hjemmel"
    );
    expect(
      screen.getByRole("textbox", { name: /Rettskildetittel/i })
    ).toHaveValue("Rettskildetittel");
    expect(
      screen.getByRole("textbox", { name: /Fastsettingsdato/i })
    ).toHaveValue("2022-12-31");
    expect(screen.getByRole("link", { name: /doklenke/i })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /internref/i })
    ).toBeInTheDocument();
  });

  it("should add new dokumentlenke on enter and Legg til button click", () => {
    testFieldArray(/dokumentlenker/i);
  });

  it("should add new internreferanse on enter and Legg til button click", () => {
    testFieldArray(/internreferanse/i);
  });
});
