import { renderHook } from "@testing-library/react-hooks";
import useFeatureHistory from "./useFeatureHistory";

describe("useFeatureHistory", () => {
  it("should have no dirty ids initially", () => {
    const { result } = renderHook(() => useFeatureHistory());

    expect(result.current.dirtyFeatureIds).toHaveLength(0);
  });
});
