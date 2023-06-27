import styled from "styled-components";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { Metadata, FeatureProperties } from "types/api";
import Input from "components/Input";
import useMetadataForm from "components/Kart/OverlayPanels/hooks/useMetadataForm";
import { getDateInFriendlyString } from "components/Kart/OverlayPanels/MetadataPanel/utils";
import AsyncKodelisteSelect from "./AsyncKodelisteSelect";
import useIsMetadataDisabled from "../hooks/useIsMetadataDisabled";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useEffect } from "react";
import {
  Button,
  Divider,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Textarea,
} from "@kvib/react";
import Label from "components/Label";

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
  grid-template-columns: auto auto;
  gap: 16px;
`;

const Buttons = styled.div`
  display: flex;
  justify-content: end;
  gap: 16px;
`;

const MetadataGenerelt = ({ feature }: Props) => {
  const { closeOverlayPanel } = useOverlayPanel();
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
            label="Målemetode"
            {...register("maalemetode", { disabled: metadataIsDisabled })}
          />
          <Label label="Nøyaktighet">
            <NumberInput>
              <NumberInputField
                {...register("noeyaktighet", {
                  disabled: metadataIsDisabled,
                  valueAsNumber: true,
                  min: 0,
                  max: 1_000_000,
                })}
              />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </Label>
        </InputRow>
        <Input
          {...register("opphav", { disabled: metadataIsDisabled })}
          label="Opphav"
        />
        <Label label="Informasjon">
          <Textarea
            rows={4}
            {...register("informasjon", { disabled: metadataIsDisabled })}
          />
        </Label>
        <Divider />
        <Buttons>
          <Button
            variant="ghost"
            onClick={() => {
              reset();
              closeOverlayPanel();
            }}
            isDisabled={metadataIsDisabled}
          >
            Avbryt
          </Button>
          <Button type="submit" isDisabled={!isDirty || metadataIsDisabled}>
            Endre metadata
          </Button>
        </Buttons>
      </Form>
    </Container>
  );
};

export default MetadataGenerelt;
