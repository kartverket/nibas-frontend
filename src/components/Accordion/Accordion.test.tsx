import { fireEvent, render, screen } from "test/test-utils";
import Accordion from "./Accordion";

describe("Accordion", () => {
  it("should not render children initially", () => {
    render(
      <Accordion title="Title">
        <span>Children</span>
      </Accordion>
    );

    expect(screen.queryByText("Children")).not.toBeInTheDocument();
  });

  it("should show and hide children after clicking caret", () => {
    render(
      <Accordion title="Title">
        <span>Children</span>
      </Accordion>
    );

    fireEvent.click(screen.getByRole("button", { name: "Title" }));
    expect(screen.getByText("Children")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Title" }));
    expect(screen.queryByText("Children")).not.toBeInTheDocument();
  });
});
