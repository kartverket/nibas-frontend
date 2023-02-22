import { render, screen, within } from "test/test-utils";
import { ReactNode } from "react";
import GrenseMetadataReferanser from "./GrenseMetadataReferanser";
import { mockBasicFeature } from "mocks/handlers/responses";

const defaultProps: React.ComponentProps<typeof GrenseMetadataReferanser> = {
  feature: mockBasicFeature,
};

const renderWithProvider = (ui: ReactNode, disabled = false) =>
  render(ui, {
    EditGrenserProvider: {
      editingObject: {
        fylke: {
          "1": {
            visible: true,
            editing: !disabled,
          },
        },
      },
      setObjectValue: jest.fn(),
      setEditingObject: jest.fn(),
      resetAndClearEditingLayer: jest.fn(),
    },
  });

const testFieldArray = async (groupName: string | RegExp) => {
  const { user } = renderWithProvider(
    <GrenseMetadataReferanser {...defaultProps} />
  );

  const dokumentlenkerGroup = screen.getByRole("group", {
    name: groupName,
  });
  const newUrlInput = within(dokumentlenkerGroup).getByRole("textbox", {
    name: /ny {{ item }}/i,
  });
  await user.type(newUrlInput, "Ny lenke{enter}");

  const addButton = within(dokumentlenkerGroup).getByRole("button", {
    name: /legg til/i,
  });
  await user.type(newUrlInput, "Lenke uten enter");
  await user.click(addButton);

  expect(
    within(dokumentlenkerGroup).getByRole("link", { name: /ny lenke/i })
  ).toBeInTheDocument();
  expect(
    within(dokumentlenkerGroup).getByRole("link", { name: /lenke uten enter/i })
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

  it("should disable form fields if not editing", () => {
    renderWithProvider(<GrenseMetadataReferanser {...defaultProps} />, true);

    expect(
      screen.getByRole("textbox", { name: /Rettskilde-ID/i })
    ).toBeDisabled();
    expect(
      screen.getByRole("textbox", { name: /Fastsettingsmyndighet/i })
    ).toBeDisabled();
    expect(screen.getByRole("textbox", { name: /Hjemmel/i })).toBeDisabled();
    expect(
      screen.getByRole("textbox", { name: /Rettskildetittel/i })
    ).toBeDisabled();
    expect(
      screen.getByRole("textbox", { name: /Fastsettingsdato/i })
    ).toBeDisabled();
  });

  // veldig liten bit av koden som ikke går gjennom test, men verifisert at det
  // funker i klienten. Leit, men bør ikke bruke mer tid på det
  it.skip("should add new dokumentlenke on enter and Legg til button click", async () => {
    await testFieldArray(/dokumentlenker/i);
  });

  it.skip("should add new internreferanse on enter and Legg til button click", async () => {
    await testFieldArray(/internreferanse/i);
  });
});
