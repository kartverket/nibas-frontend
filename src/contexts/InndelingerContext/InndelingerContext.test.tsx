import { describe, it } from "vitest";
import { Inndeling, InndelingerProvider, useInndelinger } from "./InndelingerContext";
import { act, renderHook } from "test/test-utils";
import { MockFeatureStyleProvider } from "mocks/contexts/FeatureStyleContextMock";
import { MockUtkastProvider } from "mocks/contexts/UtkastContextMock";

const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <MockUtkastProvider>
    <MockFeatureStyleProvider>
      <InndelingerProvider>{children}</InndelingerProvider>
    </MockFeatureStyleProvider>
  </MockUtkastProvider>
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

const { result } = renderHook(() => useInndelinger(), { wrapper: AllProviders });

const { selectInndelinger, clearInndelingerAndSources } = result.current;

afterEach(() => {
  clearInndelingerAndSources();
});

describe("InndelingerContext", () => {
  it("should do some stuff", () => {
    const inndelingerToSelect: Inndeling[] = [
      {
        id: "123",
        inndelingtype: "kommune",
        isEditing: true,
        isVisible: false,
        navn: [
          {
            navn: "asd",
            spraak: "nor",
            version: 1,
          },
        ],
        nummer: "123",
      },
    ];

    act(() => selectInndelinger(inndelingerToSelect));
  });

  it("should do some stuff again", () => {});
});
