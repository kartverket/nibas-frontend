import { render, screen } from "test/test-utils";
import FylkeList from "./FylkeList";
import { EditGrenserProvider } from "components/GrenserDrillDown/EditGrenserContext";

describe("FylkeList", () => {
  it("should render two names from fylker", async () => {
    render(
      <EditGrenserProvider isOpen>
        <FylkeList />
      </EditGrenserProvider>
    );

    expect(await screen.findByText("Vestfold og Telemark")).toBeInTheDocument();
    expect(await screen.findByText("Agder")).toBeInTheDocument();
  });
});
