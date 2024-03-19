import { render, screen, userEvent } from "test/test-utils";
import KoordinaterPanel from "./KoordinaterPanel";

const defaultProps: React.ComponentProps<typeof KoordinaterPanel> = {
  isOpen: true,
};

describe("KoordinaterPanel", async () => {
  const user = userEvent.setup();

  it("should allow positive and negative integers", async () => {
    render(<KoordinaterPanel {...defaultProps} />);

    const nord = await screen.findByLabelText("Nord");
    const ost = await screen.findByLabelText("Øst");

    await user.type(nord, "1");
    await user.type(ost, "-1");

    expect(nord).toBeValid();
    expect(ost).toBeValid();
  });

  it("should allow positive and negative decimals", async () => {
    render(<KoordinaterPanel {...defaultProps} />);

    const nord = await screen.findByLabelText("Nord");
    const ost = await screen.findByLabelText("Øst");

    await user.type(nord, "1.0");
    await user.type(ost, "-1.0");

    expect(nord).toBeValid();
    expect(ost).toBeValid();
  });

  it("should not allow text", async () => {
    render(<KoordinaterPanel {...defaultProps} />);

    const nord = await screen.findByLabelText("Nord");
    const ost = await screen.findByLabelText("Øst");

    await user.type(nord, "e");
    await user.type(ost, "f");

    expect(nord).toBeInvalid();
    expect(ost).toBeInvalid();
  });

  it("should not allow leading or trailing period", async () => {
    render(<KoordinaterPanel {...defaultProps} />);

    const nord = await screen.findByLabelText("Nord");
    const ost = await screen.findByLabelText("Øst");

    await user.type(nord, ".1");
    await user.type(ost, "1.");

    expect(nord).toBeInvalid();
    expect(ost).toBeInvalid();
  });

  it("should not allow whitespace", async () => {
    render(<KoordinaterPanel {...defaultProps} />);

    const nord = await screen.findByLabelText("Nord");
    const ost = await screen.findByLabelText("Øst");

    await user.type(nord, " ");
    await user.type(ost, "  ");

    expect(nord).toBeInvalid();
    expect(ost).toBeInvalid();
  });
});
