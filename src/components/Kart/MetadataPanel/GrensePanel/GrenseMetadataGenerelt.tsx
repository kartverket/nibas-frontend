import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components";
import AsyncKodelisteSelect from "../AsyncKodelisteSelect";
import {
  BlockLabel,
  Container,
  DateWrapper,
  MetadataText,
  MetadataValue,
  Part,
} from "../metadataComponents";
import useIsMetadataDisabled from "../useIsMetadataDisabled";
import useMetadataForm from "../useMetadataForm";
import { getDateInFriendlyString } from "../utils";
import Button from "components/form/Button";
import Input from "components/form/Input";
import Select from "components/form/Select";
import useScreenWidth from "hooks/useScreenWidth";
import { Metadata, FeatureProperties } from "types/api";
import { MetadataEntry, useToolbarSave } from "contexts/ToolbarContext";
import { useEffect } from "react";
import LineString from "ol/geom/LineString";
import { dirtyStyles } from "utils/map/layerStyles";

type Props = {
  feature: Feature<Geometry>;
};

const GrenseMetadataGenerelt = ({ feature }: Props) => {
  const properties = feature.getProperties() as FeatureProperties;
  const type = properties.type;
  const metadata = properties.metadata as Metadata;

  const { register, maalemetodeKoder, writeMetadataToFeature } =
    useMetadataForm(metadata, feature);

  const { addEntry } = useToolbarSave("metadata");

  const updateDraftOnBlur = () => {
    const id = feature.getId();

    if (!id) return;

    const oldMetadata = feature.clone().getProperties().metadata as Metadata;

    writeMetadataToFeature();

    addEntry({
      type: "metadata",
      changes: [
        {
          id: id as string,
          from: oldMetadata,
          to: feature.getProperties().metadata as Metadata,
        },
      ],
    });
  };

  const screenWidth = useScreenWidth();
  const theme = useTheme();
  const { t } = useTranslation();

  const disabled = useIsMetadataDisabled(properties);

  const formOptions = { disabled, onBlur: updateDraftOnBlur };

  return (
    <form>
      <Container>
        <Part>
          <BlockLabel>
            {t("metadata.Grensetype")}
            <Select disabled>
              <option>{type}</option>
            </Select>
          </BlockLabel>
          <DateWrapper>
            <BlockLabel>
              {t("metadata.Gyldig fra")}
              <Input
                type="date"
                role="textbox"
                {...register("gyldigFra", formOptions)}
              />
            </BlockLabel>
            <BlockLabel>
              {t("metadata.Gyldig til")}
              <Input
                type="date"
                role="textbox"
                {...register("gyldigTil", formOptions)}
              />
            </BlockLabel>
          </DateWrapper>
        </Part>
        <Part>
          <AsyncKodelisteSelect
            kodeliste={maalemetodeKoder}
            label={t("metadata.Målemetode")}
            {...register("maalemetode", formOptions)}
          />
          <BlockLabel>
            {t("metadata.Nøyaktighet")}
            <Input
              type="number"
              {...register("noeyaktighet", {
                ...formOptions,
                valueAsNumber: true,
                min: 0,
                max: 1_000_000,
              })}
            />
          </BlockLabel>
        </Part>
        {screenWidth < theme.dimensions.lg && (
          <Part>
            <Dates
              oppdateringsdato={
                metadata?.common?.sporingsinformasjon.oppdateringsdato
              }
              datafangstdato={metadata?.common?.datafangstdato}
            />
          </Part>
        )}
      </Container>
      <BlockLabel>
        {t("metadata.Informasjon")}
        <Input {...register("informasjon", formOptions)} />
      </BlockLabel>
      <BlockLabel>
        {t("metadata.Opphav")}
        <Input {...register("opphav", formOptions)} />
      </BlockLabel>
      {screenWidth >= theme.dimensions.lg && (
        <Part>
          <Dates
            oppdateringsdato={
              metadata?.common?.sporingsinformasjon.oppdateringsdato
            }
            datafangstdato={metadata?.common?.datafangstdato}
          />
        </Part>
      )}
    </form>
  );
};

type DatesProps = {
  oppdateringsdato?: string;
  datafangstdato?: string;
};

const Dates = ({ oppdateringsdato, datafangstdato }: DatesProps) => (
  <>
    <div>
      <MetadataText>Oppdateringsdato</MetadataText>
      <MetadataValue>
        {getDateInFriendlyString(oppdateringsdato) ?? "---"}
      </MetadataValue>
    </div>
    <div>
      <MetadataText>Datafangstdato</MetadataText>
      <MetadataValue>
        {getDateInFriendlyString(datafangstdato) ?? "---"}
      </MetadataValue>
    </div>
  </>
);

export default GrenseMetadataGenerelt;
