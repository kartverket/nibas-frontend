import { render, screen } from "test/test-utils";
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

  it("should show and hide children after clicking caret", async () => {
    const { user } = render(
      <Accordion title="Title">
        <span>Children</span>
      </Accordion>
    );

    await user.click(screen.getByRole("button", { name: /title åpne/i }));
    expect(screen.getByText("Children")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /title lukk/i }));
    expect(screen.queryByText("Children")).not.toBeInTheDocument();
  });
});
