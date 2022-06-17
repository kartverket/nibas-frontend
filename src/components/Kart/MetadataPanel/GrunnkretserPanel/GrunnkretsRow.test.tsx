import { render, screen } from "test/test-utils";
import React, { ReactElement } from "react";
import GrunnkretsRow from "./GrunnkretsRow";
import { mockGrunnkrets1 } from "mocks/handlers/responses";

const defaultProps: React.ComponentProps<typeof GrunnkretsRow> = {
  grunnkrets: mockGrunnkrets1,
};

const renderWithTableWrapper = (ui: ReactElement) =>
  render(
    <table>
      <tbody>{ui}</tbody>
    </table>
  );

describe("GrunnkretsRow", () => {
  it("should display --- when not fetched grunnkrets", () => {
    renderWithTableWrapper(<GrunnkretsRow {...defaultProps} />);

    expect(screen.getAllByRole("cell", { name: /---/i })).toHaveLength(2);
  });

  it("should display grunnkrets navn and grunnkretsnummer", async () => {
    renderWithTableWrapper(<GrunnkretsRow {...defaultProps} />);

    expect(
      await screen.findByRole("cell", { name: /mosekollen øst/i })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("cell", { name: /12345678/i })
    ).toBeInTheDocument();
  });
});
