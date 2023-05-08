import { render, screen, waitFor } from "test/test-utils";
import MetadataGenerelt from "./MetadataGenerelt";
import { mockBasicFeature } from "mocks/handlers/responses";

const defaultProps: React.ComponentProps<typeof MetadataGenerelt> = {
  feature: mockBasicFeature,
};

describe("MetadataGenerelt", () => {
  it("should display data from feature properties", async () => {
    render(<MetadataGenerelt {...defaultProps} />);

    expect(screen.getByRole("textbox", { name: /informasjon/i })).toHaveValue(
      "Informasjon"
    );
    expect(screen.getByRole("textbox", { name: /opphav/i })).toHaveValue(
      "Opphav"
    );
    expect(screen.getByText(/gyldig fra/i)).toBeInTheDocument();
    expect(screen.getByText(/gyldig til/i)).toBeInTheDocument();

    expect(screen.getAllByText("18.6.2020")).toHaveLength(2);
    expect(screen.getAllByText("15.6.2020")).toHaveLength(2);

    await waitFor(() =>
      expect(screen.getByRole("combobox", { name: /målemetode/i })).toHaveValue(
        "9b4ab6bb-878f-472a-9243-64e2bdc48b8c"
      )
    );
  });
});
