import { render, screen, waitFor } from "test/test-utils";
import { ReactNode } from "react";
import userEvent from "@testing-library/user-event";
import StemmekretserPanel from "./StemmekretserPanel";
import { ToolbarProvider } from "contexts/ToolbarContext";
import { mockKommuner } from "mocks/handlers/responses";

const defaultProps: React.ComponentProps<typeof StemmekretserPanel> = {
  kommune: mockKommuner[0],
};

const renderWithProvider = (ui: ReactNode) =>
  render(<ToolbarProvider>{ui}</ToolbarProvider>);

describe("StemmekretserPanel", () => {
  it("should render kommunes stemmekretser in table", async () => {
    renderWithProvider(<StemmekretserPanel {...defaultProps} />);

    expect(await screen.findByRole("table")).toBeInTheDocument();

    await waitFor(() => {
      // 2 stemmekretser + 1 header row
      expect(screen.getAllByRole("row")).toHaveLength(3);
    });
    expect(
      await screen.findByRole("cell", { name: /slemfjord/i })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("cell", { name: /12/i })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("cell", { name: /16/i })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("cell", { name: /tellekretsnr1/i })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("cell", { name: /tellekretsnavn1/i })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("cell", { name: /undredal/i })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("cell", { name: /05/i })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("cell", { name: /14/i })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("cell", { name: /tellekretsnr2/i })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("cell", { name: /tellekretsnavn2/i })
    ).toBeInTheDocument();
  });

  it("should not render editrow when accordion is closed", async () => {
    renderWithProvider(<StemmekretserPanel {...defaultProps} />);

    expect(await screen.findAllByRole("cell")).toHaveLength(12); // 2x 6 celler
  });

  it("should render EditRow on Caret toggle", async () => {
    renderWithProvider(<StemmekretserPanel {...defaultProps} />);

    userEvent.click(
      (
        await screen.findAllByRole("button", {
          name: /Åpne redigering av stemmekrets/i,
        })
      )[0]
    );

    expect(await screen.findAllByRole("cell")).toHaveLength(13); // 2x 6 celler + 1 editrow
  });
});
