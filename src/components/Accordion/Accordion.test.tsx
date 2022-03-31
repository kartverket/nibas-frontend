import { render, screen } from "test/test-utils";
import userEvent from "@testing-library/user-event";
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

    userEvent.click(screen.getByRole("button", { name: /title åpne/i }));
    expect(screen.getByText("Children")).toBeInTheDocument();

    userEvent.click(screen.getByRole("button", { name: /title lukk/i }));
    expect(screen.queryByText("Children")).not.toBeInTheDocument();
  });
});
