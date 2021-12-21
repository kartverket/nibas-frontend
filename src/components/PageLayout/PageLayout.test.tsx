import { fireEvent, render, screen } from "test/test-utils";
import PageLayout from "./PageLayout";

describe("PageLayout", () => {
  it("should open nibas panel on nibas sidebar button click", () => {
    render(<PageLayout />);

    const nibasButton = screen.getByRole("button", { name: /nibas/i });
    fireEvent.click(nibasButton);

    expect(
      screen.getByRole("heading", { name: /grenser/i })
    ).toBeInTheDocument();
  });

  it("should open bakgrunnskart panel on bakgrunsskart button click", () => {
    render(<PageLayout />);

    const bakgrunnskartButton = screen.getByRole("button", {
      name: /bakgrunnskart/i,
    });
    fireEvent.click(bakgrunnskartButton);

    expect(
      screen.getByRole("heading", { name: /bakgrunnskart/i })
    ).toBeInTheDocument();
  });
});
