import { render, screen, waitFor } from "test/test-utils";
import AdministrativGrenseDetaljer from "./AdministrativGrenseDetaljer";
import { mockBasicFeature } from "mocks/handlers/responses";

const defaultProps: React.ComponentProps<typeof AdministrativGrenseDetaljer> = {
  feature: mockBasicFeature,
};

describe("AdministrativGrenseDetaljer", () => {
  it("should display data from feature properties", async () => {
    render(<AdministrativGrenseDetaljer {...defaultProps} />);

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
