import { render, screen, userEvent } from "test/test-utils";
import KoordinaterPanel from "./KoordinaterPanel";

const defaultProps: React.ComponentProps<typeof KoordinaterPanel> = {
  isOpen: true,
};

describe("KoordinaterPanel", () => {
  it("it should allow only decimal or integer inputs", async () => {
    render(<KoordinaterPanel {...defaultProps} />);

    const user = userEvent.setup();
    const nord = await screen.findByLabelText("Nord");
    const ost = await screen.findByLabelText("Øst");

    await user.type(nord, "1.0");
    await user.type(ost, ".0");

    expect(nord).toBeValid();
    expect(ost).toBeInvalid();

    await user.type(nord, "1");
    await user.type(ost, "0.");

    expect(nord).toBeValid();
    expect(ost).toBeInvalid();

    await user.type(nord, "0");
    await user.type(ost, "e");

    expect(nord).toBeValid();
    expect(ost).toBeInvalid();
  });
});
