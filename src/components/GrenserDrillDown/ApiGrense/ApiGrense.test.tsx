import { render, screen } from "test/test-utils";
import ApiGrense from "./ApiGrense";
import { EditGrenserProvider } from "contexts/EditGrenserContext";
import { UtkastContext } from "contexts/UtkastContext";

const defaultProps: React.ComponentProps<typeof ApiGrense> = {
  featuresUrl: "/",
  grense: {
    id: "1",
    navn: [{ navn: "Grense", spraak: "nor", version: 1 }],
    href: "href",
  },
  type: "fylke",
};

describe("ApiGrense", () => {
  it("should render name in Norwegian", () => {
    render(
      <EditGrenserProvider>
        <UtkastContext.Provider
          value={{ utkast: undefined, updateUtkastWithHistory: jest.fn() }}
        >
          <ApiGrense {...defaultProps} />
        </UtkastContext.Provider>
      </EditGrenserProvider>
    );

    expect(screen.getByText(/grense/i)).toBeInTheDocument();
  });
});
