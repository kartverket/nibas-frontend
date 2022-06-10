import { render, screen, waitFor } from "test/test-utils";
import { ReactNode } from "react";
import AdministrativGrenseDetaljer from "./AdministrativGrenseDetaljer";
import { EditGrenserProvider } from "contexts/EditGrenserContext";
import { mockBasicFeature } from "mocks/handlers/responses";

const defaultProps: React.ComponentProps<typeof AdministrativGrenseDetaljer> = {
  feature: mockBasicFeature,
};

const renderWithProvider = (ui: ReactNode) =>
  render(<EditGrenserProvider>{ui}</EditGrenserProvider>);

describe("AdministrativGrenseDetaljer", () => {
  it("should display data from feature properties", async () => {
    renderWithProvider(<AdministrativGrenseDetaljer {...defaultProps} />);

    expect(screen.getByRole("radio", { name: "Ja" })).not.toBeChecked();
    expect(screen.getByRole("radio", { name: "Nei" })).toBeChecked();

    await waitFor(() =>
      expect(
        screen.getByRole("combobox", { name: /Følger terrengdetalj/i })
      ).toHaveValue("IKA")
    );
    await waitFor(() =>
      expect(
        screen.getByRole("combobox", { name: /Nøyaktighetsklasse/i })
      ).toHaveValue("IngenNøyaktighet")
    );
  });
});
