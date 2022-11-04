import { render, screen } from "test/test-utils";
import React from "react";
import KommuneList from "./KommuneList";

const defaultProps: React.ComponentProps<typeof KommuneList> = {
  fylke: {
    id: "2",
    navn: [{ navn: "Fylke", spraak: "nor", version: 1 }],
    href: "href1",
  },
};

describe("KommuneList", () => {
  it("should render two kommuner from API request", async () => {
    const { user } = render(<KommuneList {...defaultProps} />);

    await user.click(await screen.findByRole("button", { name: /fylke/i }));

    expect(await screen.findByText("Malvik")).toBeInTheDocument();
    expect(await screen.findByText("Giske")).toBeInTheDocument();
  });
});
