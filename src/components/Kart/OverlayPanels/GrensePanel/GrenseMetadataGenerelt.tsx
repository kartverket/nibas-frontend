import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { useTranslation } from "react-i18next";
import AsyncKodelisteSelect from "../AsyncKodelisteSelect";
import {
  Container,
  DateRow,
  InputRow,
  MetadataText,
  MetadataValue,
  Part,
  Separator,
  Date,
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

const MetadataWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 36px;
  padding-bottom: 16px;
`;

const FormWrapper = styled.div`
  display: flex;
  width: 100%;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

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
      <MetadataWrapper>
        <FormWrapper>
          <Form>
            <Container>
              <InputRow>
                <AsyncKodelisteSelect
                  kodeliste={maalemetodeKoder}
                  label={t("metadata.Målemetode")}
                  {...register("maalemetode", inputOptions)}
                />
                <Input
                  type="number"
                  label={t("metadata.Nøyaktighet")}
                  {...register("noeyaktighet", {
                    ...inputOptions,
                    valueAsNumber: true,
                    min: 0,
                    max: 1_000_000,
                  })}
                />
              </InputRow>
            </Container>
            <Input
              {...register("opphav", inputOptions)}
              label={t("metadata.Opphav")}
            />
            <Textarea
              rows={4}
              {...register("informasjon", inputOptions)}
              label={t("metadata.Informasjon")}
            />

            <LargePart>
              <Dates
                oppdateringsdato={
                  metadata?.common?.sporingsinformasjon.oppdateringsdato
                }
                datafangstdato={metadata?.common?.datafangstdato}
              />
            </LargePart>
          </Form>
        </FormWrapper>

        <InformationWrapper>
          <b>Grensetype</b>
          <span>{type}</span>
          <b>Gyldig fra</b>
          <span>
            {getDateInFriendlyString(metadata?.common?.gyldigFra) ?? "--"}
          </span>
          <b>Gyldig til</b>
          <span>
            {getDateInFriendlyString(metadata?.common?.gyldigTil) ?? "--"}
          </span>
        </InformationWrapper>
      </MetadataWrapper>
      <Separator />
      <Dates
        oppdateringsdato={
          metadata?.common?.sporingsinformasjon.oppdateringsdato
        }
        datafangstdato={metadata?.common?.datafangstdato}
      />
    </div>
  );
};

type DatesProps = {
  oppdateringsdato?: string;
  datafangstdato?: string;
};

const Dates = ({ oppdateringsdato, datafangstdato }: DatesProps) => (
  <>
    <DateRow>
      <Date>
        <MetadataText>Datafangst</MetadataText>
        <MetadataValue>
          {getDateInFriendlyString(datafangstdato) ?? "--"}
        </MetadataValue>
      </Date>
      <Date>
        <MetadataText>Sist oppdatert</MetadataText>
        <MetadataValue>
          {getDateInFriendlyString(oppdateringsdato) ?? "--"}
        </MetadataValue>
      </Date>
    </DateRow>
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
  background: var(--gray_light);
  color: var(--black);
  display: grid;
  padding: 16px;
  margin-bottom: 30px;
  font-size: 16px;
  grid-template-columns: auto 1fr;
  grid-gap: 6px 12px;
  flex: 1;
  width: 100%;
  height: 100%;
`;
