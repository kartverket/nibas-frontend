import { Feature } from "ol";
import { Geometry } from "ol/geom";
import { FeatureProperties } from "types/api";
import useIsMetadataDisabled from "../hooks/useIsMetadataDisabled";
import MetadataRow from "./MetadataRow";
import { Select, Stack } from "@kvib/react";
import { GrenseType } from "hooks/layers/types";
import { useTilhorighet } from "../hooks/useTilhorighet";
import { useEffect } from "react";

export enum Tilhorighet {
  A = "a",
  B = "b",
}

type TilhorighetProps = {
  feature: Feature<Geometry>;
  isDisabled?: boolean;
  tilhorighetToChange: "grunnkretser" | "stemmekretser";
};

export const TilhorighetField = ({
  feature,
  isDisabled,
  tilhorighetToChange,
}: TilhorighetProps) => {
  const properties = feature.getProperties() as FeatureProperties;
  const kontekstEgenskaper = properties.kontekstEgenskaper;
  const kommuneId = flatedata ? getIdFromEntity(flatedata) : "";
  const [isFlateModalOpen, setIsFlateModalOpen] = useState(false);
  const [nyFlateForTilhorighet, setNyFlateForTilhorighet] = useState<
    Tilhorighet | undefined
  >(undefined);

  const metadataIsDisabled = useIsMetadataDisabled(feature, properties);

  const openModal = (
    open: boolean,
    tilhorighetContext: Tilhorighet | undefined,
  ) => {
    setIsFlateModalOpen(open);
    setNyFlateForTilhorighet(tilhorighetContext);
  };

  const grenseType = properties.type as GrenseType;

  const {
    data: tilhorighetOptions,
    isDirty,
    getValuesFormatted,
    resetTilhorighet,
    getTilhorighetData,
    register,
    updateDraftFromFeature,
    setValue,
  } = useTilhorighet(
    feature,
    grenseType,
    tilhorighetToChange,
    kontekstEgenskaper,
  );

  useEffect(() => {
    resetTilhorighet();
  }, [getTilhorighetData, feature, tilhorighetOptions, resetTilhorighet]);
  return (
    <>
      <MetadataRow
        feature={feature}
        name={"Tilhørighet"}
        valueLabel={getValuesFormatted() ?? "Ikke definert"}
        onMetadataSubmit={() => updateDraftFromFeature()}
        isDisabled={metadataIsDisabled}
        isDirty={isDirty}
        reset={resetTilhorighet}
        tooltipLabel={""}
      >
        <Stack>
          {Object.values(Tilhorighet).map((tilhorighet) => (
            <Select
              key={tilhorighet}
              {...tilhorighetRegisters[tilhorighet]}
              onChange={(e) => {
                tilhorighetRegisters[tilhorighet].onChange(e);
                if (e.target.value === Option.NY_FLATE) {
                  openModal(true, tilhorighet);
                }
              }}
            >
              <option
                key={Option.NY_FLATE}
                value={`${Option.NY_FLATE}.${tilhorighet}`}
              >
                {"<Opprett ny flate>"}
              </option>
              {tilhorighetOptions &&
                tilhorighetOptions.map((krets) => {
                  const uid = `${tilhorighet}_${krets.id.lokalid.value}`;
                  return (
                    <option key={uid} value={krets.id.lokalid.value}>
                      {krets.nummer} {krets.navn}
                    </option>
                  );
                })}
            </Select>
          ))}
        </Stack>
      </MetadataRow>
      <FlateFormModal
        isOpen={isFlateModalOpen}
        onClose={() => openModal(false, undefined)}
        featureProps={properties}
        flatedata={flatedata}
        tilhorighet={nyFlateForTilhorighet}
        setTilhorighet={setValue}
        updateTilhorighet={updateDraftFromFeature}
      />
    </>
  );
};
