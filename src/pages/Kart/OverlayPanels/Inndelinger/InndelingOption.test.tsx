import { render } from "@testing-library/react";
import { describe, it } from "vitest";
import InndelingOption from "./InndelingOption";

describe("InndelingOption", () => {
  it("should be a radio input if radio prop is sent", () => {
    const { queryByTestId } = render(
      <InndelingOption isActive={false} onClick={() => {}} type="radio">
        <>Test</>
      </InndelingOption>,
    );

    expect(queryByTestId("radio_input")).toBeTruthy();
    expect(queryByTestId("checkbox_input")).toBeNull();
  });

  it("should be a checkbox input if checkbox prop is sent", () => {
    const { queryByTestId } = render(
      <InndelingOption isActive={false} onClick={() => {}} type="checkbox">
        <>Test</>
      </InndelingOption>,
    );

    expect(queryByTestId("checkbox_input")).toBeTruthy();
    expect(queryByTestId("radio_input")).toBeNull();
  });

  it("should not have an input if button prop is sent", () => {
    const { queryByTestId } = render(
      <InndelingOption isActive={false} onClick={() => {}} type="button">
        <>Test</>
      </InndelingOption>,
    );

    expect(queryByTestId("checkbox_input")).toBeNull();
    expect(queryByTestId("radio_input")).toBeNull();
  });

  it("should have a checked input field if isActive is true", () => {
    const { getByRole } = render(
      <InndelingOption isActive={true} onClick={() => {}} type="checkbox">
        <>Test</>
      </InndelingOption>,
    );

    expect(getByRole("checkbox", { checked: true })).toBeTruthy();
  });
});
