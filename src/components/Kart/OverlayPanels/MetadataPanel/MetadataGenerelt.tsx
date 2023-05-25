import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { Metadata, FeatureProperties } from "types/api";
import Input from "components/form/Input";
import Textarea from "components/form/Input/Textarea";
import useMetadataForm from "components/Kart/OverlayPanels/hooks/useMetadataForm";
import { getDateInFriendlyString } from "components/Kart/OverlayPanels/MetadataPanel/utils";
import AsyncKodelisteSelect from "./AsyncKodelisteSelect";
import { Divider } from "components/Divider";
import Button from "components/form/Button/Button";
import useIsMetadataDisabled from "../hooks/useIsMetadataDisabled";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useEffect } from "react";

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

const Buttons = styled.div`
  display: flex;
  justify-content: end;
  gap: 16px;
`;

const MetadataGenerelt = ({ feature }: Props) => {
  const { closeOverlayPanel } = useOverlayPanel();
  const { t } = useTranslation();
  const properties = feature.getProperties() as FeatureProperties;
  const type = properties.type;
  const metadata = properties.metadata as Metadata;

  const {
    register,
    handleSubmit,
    maalemetodeKoder,
    updateDraftFromFeature,
    isDirty,
    reset,
    getFormFromApiMetadata,
  } = useMetadataForm(metadata, feature);

  // Still tilbake til default-verdier dersom man bytter valgt feature
  useEffect(() => {
    reset(getFormFromApiMetadata(metadata));
  }, [getFormFromApiMetadata, metadata, reset]);

  const metadataIsDisabled = useIsMetadataDisabled(properties);

  const onSubmit = () => {
    updateDraftFromFeature();
    reset(undefined, { keepValues: true });
  };

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
      <Form onSubmit={handleSubmit(onSubmit)}>
        <InputRow>
          <AsyncKodelisteSelect
            kodeliste={maalemetodeKoder}
            label={t("metadata.Målemetode")}
            {...register("maalemetode", { disabled: metadataIsDisabled })}
          />
          <NumberInput
            type="number"
            label={t("metadata.Nøyaktighet")}
            {...register("noeyaktighet", {
              disabled: metadataIsDisabled,
              valueAsNumber: true,
              min: 0,
              max: 1_000_000,
            })}
          />
        </InputRow>
        <Input
          {...register("opphav", { disabled: metadataIsDisabled })}
          label={t("metadata.Opphav")}
        />
        <Textarea
          rows={4}
          {...register("informasjon", { disabled: metadataIsDisabled })}
          label={t("metadata.Informasjon")}
        />
        <Divider />
        <Buttons>
          <Button
            variant="tertiary"
            onClick={() => {
              reset();
              closeOverlayPanel();
            }}
            disabled={metadataIsDisabled}
          >
            Avbryt
          </Button>
          <Button type="submit" disabled={!isDirty || metadataIsDisabled}>
            Endre metadata
          </Button>
        </Buttons>
      </Form>
    </Container>
  );
};

export default MetadataGenerelt;
