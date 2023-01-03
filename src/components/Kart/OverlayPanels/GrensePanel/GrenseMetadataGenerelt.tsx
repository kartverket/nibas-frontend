import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { useTranslation } from "react-i18next";
import AsyncKodelisteSelect from "../AsyncKodelisteSelect";
import {
  BlockLabel,
  Container,
  InputRow,
  MetadataText,
  MetadataValue,
  Part,
} from "../metadataComponents";
import useMetadataForm from "../useMetadataForm";
import { getDateInFriendlyString } from "../utils";
import Input from "components/form/Input";
import { Metadata, FeatureProperties } from "types/api";
import useMetadataInputOptions from "hooks/useMetadataInputOptions";
import styled from "styled-components";
import Textarea from "components/form/Input/Textarea";

type Props = {
  feature: Feature<Geometry>;
};

const GrenseMetadataGenerelt = ({ feature }: Props) => {
  const properties = feature.getProperties() as FeatureProperties;
  const type = properties.type;
  const metadata = properties.metadata as Metadata;

  const { register, maalemetodeKoder, updateDraftFromFeature } =
    useMetadataForm(metadata, feature);

  const { t } = useTranslation();

  const inputOptions = useMetadataInputOptions({
    properties,
    updateDraftFromFeature,
  });

  return (
    <div>
      <InformationWrapper>
        <b>Grensetype</b>
        <span>{type}</span>
        <b>Gyldig fra</b>
        <span>1048-948</span>
        <b>Gyldig til</b>
        <span>07-08-96</span>
      </InformationWrapper>
      <form>
        <Container>
          <InputRow>
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
          </InputRow>
        </Container>
        <BlockLabel>
          {t("metadata.Informasjon")}
          <Textarea rows={4} {...register("informasjon", inputOptions)} />
        </BlockLabel>
        <BlockLabel>
          {t("metadata.Opphav")}
          <Input {...register("opphav", inputOptions)} />
        </BlockLabel>
        <LargePart>
          <Dates
            oppdateringsdato={
              metadata?.common?.sporingsinformasjon.oppdateringsdato
            }
            datafangstdato={metadata?.common?.datafangstdato}
          />
        </LargePart>
      </form>
    </div>
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

const LargePart = styled(Part)`
  display: none;

  @media (min-width: var(--screenBreakXxl)) {
    display: unset;
  }
`;

const InformationWrapper = styled.div`
  width: 100%;
  height: 100%;
  background: var(--gray_light);
  color: var(--black);
  display: grid;
  padding: 16px;
  margin-bottom: 30px;
  font-size: 16px;
  grid-template-columns: auto 1fr;
  grid-gap: 6px 12px;
`;
