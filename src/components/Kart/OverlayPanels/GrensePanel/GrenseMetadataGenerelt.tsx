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
import useMetadataForm from "../useMetadataForm";
import { getDateInFriendlyString } from "../utils";
import Input from "components/form/Input";
import Select from "components/form/Select";
import useScreenWidth from "hooks/useScreenWidth";
import { Metadata, FeatureProperties } from "types/api";
import useMetadataInputOptions from "hooks/useMetadataInputOptions";

type Props = {
  feature: Feature<Geometry>;
};

const GrenseMetadataGenerelt = ({ feature }: Props) => {
  const properties = feature.getProperties() as FeatureProperties;
  const type = properties.type;
  const metadata = properties.metadata as Metadata;

  const { register, maalemetodeKoder, updateDraftFromFeature, dirtyFields } =
    useMetadataForm(metadata, feature);

  const screenWidth = useScreenWidth();
  const theme = useTheme();
  const { t } = useTranslation();

  const inputOptions = useMetadataInputOptions({
    dirtyFields,
    properties,
    updateDraftFromFeature,
  });

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
                {...register("gyldigFra", inputOptions)}
              />
            </BlockLabel>
            <BlockLabel>
              {t("metadata.Gyldig til")}
              <Input
                type="date"
                role="textbox"
                {...register("gyldigTil", inputOptions)}
              />
            </BlockLabel>
          </DateWrapper>
        </Part>
        <Part>
          <AsyncKodelisteSelect
            kodeliste={maalemetodeKoder}
            label={t("metadata.Målemetode")}
            {...register("maalemetode", inputOptions)}
          />
          <BlockLabel>
            {t("metadata.Nøyaktighet")}
            <Input
              type="number"
              {...register("noeyaktighet", {
                ...inputOptions,
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
        <Input {...register("informasjon", inputOptions)} />
      </BlockLabel>
      <BlockLabel>
        {t("metadata.Opphav")}
        <Input {...register("opphav", inputOptions)} />
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
