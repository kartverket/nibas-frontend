import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { Metadata, FeatureProperties } from "types/api";
import useMetadataInputOptions from "hooks/useMetadataInputOptions";
import Input from "components/form/Input";
import Textarea from "components/form/Input/Textarea";
import useMetadataForm from "components/Kart/OverlayPanels/hooks/useMetadataForm";
import { getDateInFriendlyString } from "components/Kart/OverlayPanels/utils";
import AsyncKodelisteSelect from "./AsyncKodelisteSelect";

type Props = {
  feature: Feature<Geometry>;
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const InfoBox = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  padding: 20px 16px;
  color: var(--black);
  background: var(--gray_light);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InputRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 16px;
`;

const NumberInput = styled(Input)`
  width: 120px;
`;

const MetadataGenerelt = ({ feature }: Props) => {
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
    <Container>
      <InfoBox>
        <b>Grensetype</b>
        <span>{type}</span>
        <b>Datofangst</b>
        <span>
          {getDateInFriendlyString(metadata?.common?.datafangstdato) ?? "--"}
        </span>
        <b>Sist oppdatert</b>
        <span>
          {getDateInFriendlyString(
            metadata?.common?.sporingsinformasjon.oppdateringsdato
          ) ?? "--"}
        </span>
        <b>Gyldig fra</b>
        <span>
          {getDateInFriendlyString(metadata?.common?.gyldigFra) ?? "--"}
        </span>
        <b>Gyldig til</b>
        <span>
          {getDateInFriendlyString(metadata?.common?.gyldigTil) ?? "--"}
        </span>
      </InfoBox>
      <Form>
        <InputRow>
          <AsyncKodelisteSelect
            kodeliste={maalemetodeKoder}
            label={t("metadata.Målemetode")}
            {...register("maalemetode", inputOptions)}
          />
          <NumberInput
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
        <Input
          {...register("opphav", inputOptions)}
          label={t("metadata.Opphav")}
        />
        <Textarea
          rows={4}
          {...register("informasjon", inputOptions)}
          label={t("metadata.Informasjon")}
        />
      </Form>
    </Container>
  );
};

export default MetadataGenerelt;
