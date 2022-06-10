import { render, screen } from "test/test-utils";
import ApiGrense from "./ApiGrense";
import { EditGrenserProvider } from "contexts/EditGrenserContext";

const defaultProps: React.ComponentProps<typeof ApiGrense> = {
  featuresUrl: "/",
  grense: {
    id: "1",
    navn: [{ navn: "Grense", spraak: "nor" }],
    href: "href",
  },
  type: "fylke",
};

describe("ApiGrense", () => {
  it("should render name in Norwegian", () => {
    render(
      <EditGrenserProvider>
        <ApiGrense {...defaultProps} />
      </EditGrenserProvider>
    );

    expect(screen.getByText(/grense/i)).toBeInTheDocument();
  });
});
