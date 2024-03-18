import { render, screen } from "test/test-utils";
import FylkeList from "./FylkeList";

describe("FylkeList", () => {
  it("should render two names from fylker", async () => {
    render(<FylkeList />);

    expect(await screen.findByText("38 Vestfold og Telemark")).toBeInTheDocument();
    expect(await screen.findByText("42 Agder")).toBeInTheDocument();
  });
});
