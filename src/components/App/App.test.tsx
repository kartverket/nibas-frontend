import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  it("should render without exploding", () => {
    render(<App />);

    const nibasTitle = screen.getByText("Nasjonal inndelingsbase");

    expect(nibasTitle).toBeInTheDocument();
  });
});
