import { render } from "@testing-library/react";
import { describe, it } from "vitest";
import InndelingOption from "./InndelingOption";

describe("InndelingOption", () => {
  it("should be a radio input if radio prop is sent", () => {
    const { container } = render(
      <InndelingOption isActive={false} onClick={() => {}} type="radio">
        <>Test</>
      </InndelingOption>,
    );

    expect(container.querySelector("input")?.type).toEqual("radio");
  });

  it("should be a checkbox input if checkbox prop is sent", () => {
    const { container } = render(
      <InndelingOption isActive={false} onClick={() => {}} type="checkbox">
        <>Test</>
      </InndelingOption>,
    );

    expect(container.querySelector("input")?.type).toEqual("checkbox");
  });

  it("should not have an input if button prop is sent", () => {
    const { container } = render(
      <InndelingOption isActive={false} onClick={() => {}} type="button">
        <>Test</>
      </InndelingOption>,
    );

    expect(container.querySelector("input")?.type).toBeUndefined();
  });

  it("should have a checked input field if isActive is true", () => {
    const { container } = render(
      <InndelingOption isActive={true} onClick={() => {}} type="checkbox">
        <>Test</>
      </InndelingOption>,
    );

    expect(container.querySelector("input")?.checked).toBeTruthy();
  });
});
