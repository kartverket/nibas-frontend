import { describe, it, beforeEach } from "vitest";
import { Inndeling, InndelingerContextValue, InndelingerProvider, useInndelinger } from "./InndelingerContext";
import { renderHook } from "test/test-utils";
import { act } from "@testing-library/react";
import { MockFeatureStyleProvider } from "mocks/contexts/FeatureStyleContextMock";
import { MockUtkastProvider } from "mocks/contexts/UtkastContextMock";
import { MockHistoryProvider } from "mocks/contexts/HistoryContextMock";
import { MockOverlayPanelProvider } from "mocks/contexts/OverlayPanelContextMock";
import { MockToolbarContextProvider } from "mocks/contexts/ToolbarContextMock";
import { SWRConfig } from "swr";

// SWRConfig hindrer at SWR forsøker å lese document.visibilityState/onLine i
// bakgrunnspromises som fullfører etter at jsdom-miljøet er revet ned. Uten
// dette får vi "ReferenceError: document is not defined" som unhandled rejection
// tilfeldig i CI.
const testSwrConfig = {
  provider: () => new Map(),
  dedupingInterval: 0,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateOnMount: false,
  revalidateIfStale: false,
  isVisible: () => true,
  isOnline: () => true,
};

const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig value={testSwrConfig}>
    <MockOverlayPanelProvider>
      <MockToolbarContextProvider>
        <MockHistoryProvider>
          <MockUtkastProvider>
            <MockFeatureStyleProvider>
              <InndelingerProvider>{children}</InndelingerProvider>
            </MockFeatureStyleProvider>
          </MockUtkastProvider>
        </MockHistoryProvider>
      </MockToolbarContextProvider>
    </MockOverlayPanelProvider>
  </SWRConfig>
);

vi.mock("./useInndelingFeatures.tsx", async (importOriginal) => {
  const module = await importOriginal<typeof import("./useInndelingFeatures.tsx")>();

  return {
    ...module,
    default: () => ({
      inndelingFeatures: [],
      utkastFeaturesInInndeling: [],
      isFetching: false,
    }),
  };
});

const isEditingStemmekrets1: Inndeling = {
  id: "e-1",
  inndelingtype: "STEMMEKRETS",
  isEditing: true,
  isViewing: false,
  navn: [
    {
      navn: "e-1",
      spraak: "nor",
      version: 1,
    },
  ],
  nummer: "1",
};

const isEditingStemmekrets2: Inndeling = {
  id: "e-2",
  inndelingtype: "STEMMEKRETS",
  isEditing: true,
  isViewing: false,
  navn: [
    {
      navn: "e-2",
      spraak: "nor",
      version: 1,
    },
  ],
  nummer: "2",
};

const isEditingStemmekrets3: Inndeling = {
  id: "e-3",
  inndelingtype: "STEMMEKRETS",
  isEditing: true,
  isViewing: false,
  navn: [
    {
      navn: "e-3",
      spraak: "nor",
      version: 1,
    },
  ],
  nummer: "3",
};

const isVisibleKommune1: Inndeling = {
  id: "v-1",
  inndelingtype: "KOMMUNE",
  isEditing: false,
  isViewing: true,
  navn: [
    {
      navn: "v-1",
      spraak: "nor",
      version: 1,
    },
  ],
  nummer: "4",
};

describe("InndelingerContext", () => {
  let result: {
    current: InndelingerContextValue;
  };

  beforeEach(() => {
    const { result: newResult } = renderHook(() => useInndelinger(), { wrapper: AllProviders });
    result = newResult;

    act(() => {
      result.current.selectInndelinger([isEditingStemmekrets1, isVisibleKommune1]);
    });
  });

  it("should clear all other isEditing inndelinger when selecting new isEditing inndelinger", () => {
    const inndelingerToSelect: Inndeling[] = [isEditingStemmekrets2, isEditingStemmekrets3];

    act(() => {
      result.current.selectInndelinger(inndelingerToSelect);
    });

    const isEditingInndelingerAfterSelectIds = result.current.currentlyEditingInndelinger.map(
      (inndeling) => inndeling.id,
    );

    expect(isEditingInndelingerAfterSelectIds.sort()).toEqual(["e-2", "e-3"].sort());
  });

  it("should leave an inndeling as isEditing if selecting it again", () => {
    const inndelingerToSelect: Inndeling[] = [isEditingStemmekrets1];

    act(() => {
      result.current.selectInndelinger(inndelingerToSelect);
    });

    const isEditingInndelingerAfterSelectIds = result.current.currentlyEditingInndelinger.map(
      (inndeling) => inndeling.id,
    );

    expect(isEditingInndelingerAfterSelectIds.sort()).toEqual(["e-1"].sort());
  });

  it("should leave an inndeling as isVisible if selecting it again", () => {
    const inndelingerToSelect: Inndeling[] = [isVisibleKommune1];

    act(() => {
      result.current.selectInndelinger(inndelingerToSelect);
    });

    const isVisibleInndelingerAfterSelectIds = result.current
      .getAllInndelinger()
      .filter((inndeling) => inndeling.isViewing)
      .map((inndeling) => inndeling.id);

    expect(isVisibleInndelingerAfterSelectIds.sort()).toEqual(["v-1"].sort());
  });

  it("should not overwrite the view mode if selecting it in edit mode", () => {
    const newIsVisibleKommune1: Inndeling = {
      ...isVisibleKommune1,
      isViewing: false,
      isEditing: true,
    };

    const inndelingerToSelect: Inndeling[] = [newIsVisibleKommune1];

    act(() => {
      result.current.selectInndelinger(inndelingerToSelect);
    });

    const inndelingToCheck = result.current
      .getAllInndelinger()
      .find((inndeling) => result.current.isSameInndelinger(inndeling, newIsVisibleKommune1));

    expect(inndelingToCheck).toBeTruthy();
    expect(inndelingToCheck?.isEditing).toEqual(true);
    expect(inndelingToCheck?.isViewing).toEqual(true);
  });

  it("should not overwrite the edit mode if selecting it in view mode", () => {
    const newIsEditingStemmekrets1: Inndeling = {
      ...isEditingStemmekrets1,
      isEditing: false,
      isViewing: true,
    };

    const inndelingerToSelect: Inndeling[] = [newIsEditingStemmekrets1];

    act(() => {
      result.current.selectInndelinger(inndelingerToSelect);
    });

    const inndelingToCheck = result.current
      .getAllInndelinger()
      .find((inndeling) => result.current.isSameInndelinger(inndeling, newIsEditingStemmekrets1));

    expect(inndelingToCheck).toBeTruthy();
    expect(inndelingToCheck?.isEditing).toEqual(true);
    expect(inndelingToCheck?.isViewing).toEqual(true);
  });

  it("should remove inndelinger which are neither in edit or view mode", () => {
    act(() => {
      result.current.selectInndelinger([isEditingStemmekrets2]);
    });

    const shouldBeRemovedInndelinger = result.current
      .getAllInndelinger()
      .filter((inndeling) => !inndeling.isViewing && !inndeling.isEditing);

    expect(shouldBeRemovedInndelinger.length).toEqual(0);
  });

  it("should view both inndelingtypes if adding an inndeling with same id but different types (viewing only)", () => {
    const newIsVisibleKommune1: Inndeling = {
      ...isVisibleKommune1,
      inndelingtype: "GRUNNKRETS",
    };

    act(() => {
      result.current.selectInndelinger([isVisibleKommune1, newIsVisibleKommune1]);
    });

    const isVisibleInndelinger = result.current.getAllInndelinger().filter((inndeling) => inndeling.isViewing);

    expect(isVisibleInndelinger.length).toEqual(2);
    expect(isVisibleInndelinger[0].inndelingtype).toEqual("KOMMUNE");
    expect(isVisibleInndelinger[1].inndelingtype).toEqual("GRUNNKRETS");
  });
});
