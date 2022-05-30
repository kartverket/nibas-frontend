import { render, screen, waitFor } from "test/test-utils";
import { ReactNode } from "react";
import GrenseMetadataGenerelt from "./GrenseMetadataGenerelt";
import { EditGrenserProvider } from "components/GrenserDrillDown/EditGrenserContext";
import { mockBasicFeature } from "mocks/handlers/responses";

const defaultProps: React.ComponentProps<typeof GrenseMetadataGenerelt> = {
  feature: mockBasicFeature,
};

const renderWithProvider = (ui: ReactNode) =>
  render(<EditGrenserProvider>{ui}</EditGrenserProvider>);

describe("GrenseMetadataGenerelt", () => {
  it("should display data from feature properties", async () => {
    renderWithProvider(<GrenseMetadataGenerelt {...defaultProps} />);

    expect(screen.getByRole("textbox", { name: /informasjon/i })).toHaveValue(
      "Informasjon"
    );
    expect(screen.getByRole("textbox", { name: /opphav/i })).toHaveValue(
      "Opphav"
    );
    expect(screen.getByRole("textbox", { name: /gyldig fra/i })).toHaveValue(
      "2020-06-16"
    );
    expect(screen.getByRole("textbox", { name: /gyldig til/i })).toHaveValue(
      "2020-06-17"
    );
    expect(screen.getByText("18.6.2020")).toBeInTheDocument();
    expect(screen.getByText("15.6.2020")).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByRole("combobox", { name: /målemetode/i })).toHaveValue(
        "9b4ab6bb-878f-472a-9243-64e2bdc48b8c"
      )
    );
  });
});
