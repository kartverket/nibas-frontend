import { render, screen } from "test/test-utils";
import { ReactNode } from "react";
import AktiveKartlag from "./AktiveKartlag";
import { BakgrunnskartContext } from "contexts/BakgrunnskartContext";
import { EditGrenserContext } from "contexts/EditGrenserContext";
import { UtkastContext } from "contexts/UtkastContext";

const renderWithProvider = (ui: ReactNode) =>
  render(
    <EditGrenserContext.Provider
      value={{
        editingObject: {
          fylke: { 1: { editing: true, visible: true } },
          kommune: { 2: { editing: true, visible: true } },
        },
        setObjectValue: jest.fn(),
        setEditingObject: jest.fn(),
      }}
    >
      <UtkastContext.Provider value={{ utkast: undefined }}>
        {ui}
      </UtkastContext.Provider>
    </EditGrenserContext.Provider>
  );

describe("AktiveKartlag", () => {
  it("should render selected fylker and kommuner", async () => {
    renderWithProvider(
      <BakgrunnskartContext.Provider
        value={{
          mappedLayers: [],
          moveLayer: jest.fn(),
          orderedLayerIds: [],
          toggleLayerVisibility: jest.fn(),
          visibleLayers: {} as any,
        }}
      >
        <AktiveKartlag />
      </BakgrunnskartContext.Provider>
    );

    expect(
      await screen.findByText(/Vestfold og Telemark/i)
    ).toBeInTheDocument();
    expect(await screen.findByText(/Giske/i)).toBeInTheDocument();
  });

  it("should render visible bakgrunnskart", async () => {
    renderWithProvider(
      <BakgrunnskartContext.Provider
        value={{
          mappedLayers: [
            {
              layers: [],
              queryable: true,
              sourceId: "administrativeGrenser",
              title: "Administrative enheter WMS versjon 2",
              id: "Administrative enheter WMS versjon 2",
            },
            {
              layers: [],
              queryable: true,
              sourceId: "grunnkretserWMS",
              title: "Grunnkretser",
              id: "Grunnkretser",
            },
          ],
          moveLayer: jest.fn(),
          orderedLayerIds: ["administrativeGrenser", "grunnkretserWMS"],
          toggleLayerVisibility: jest.fn(),
          visibleLayers: {
            administrativeGrenser: true,
            grunnkretser: false,
          } as any, // vi bryr oss ikke om de andre lagene
        }}
      >
        <AktiveKartlag />
      </BakgrunnskartContext.Provider>
    );

    const administrativeEnheter = await screen.findByText(
      "Administrative enheter WMS versjon 2"
    );
    const grunnkretser = screen.queryByText("Grunnkretser");

    expect(administrativeEnheter).toBeInTheDocument();
    expect(grunnkretser).not.toBeInTheDocument();
  });
});
