import { Alert, AlertIcon, Button, InputGroup, Text, Select } from "@kvib/react";
import Input from "components/Input";
import { transform } from "ol/proj";
import { getCurrentProjection, getCurrentProjectionName } from "pages/Kart/Kartinformasjon";
import { norwayExtent } from "pages/Kart/constants";
import { useForm } from "react-hook-form";
import { styled } from "styled-components";
import { projectionDefinitions } from "utils/map/projections";
import { coordinateDecimalPattern, coordinateDecimalPatternHelperText } from "../FlyttKoordinaterPanel";
import { NavigasjonProps } from "./NavigasjonPanel";
import { useProjection } from "./useProjection";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  row-gap: 16px;
`;
const InputContainer = styled.div`
  display: flex;
  column-gap: 16px;
`;

const SpacedRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
export const KoordinaterSearch = ({ onSelect: centerOnCoordinate }: NavigasjonProps) => {
  // dette er projeksjonen brukeren sier at de gir koordinatene på
  const { selectedProjection, setProjection } = useProjection();
  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors, isDirty },
  } = useForm<{ north: number | null; east: number | null }>({
    defaultValues: { north: null, east: null },
  });

  const submitCoordinates = () => {
    const [north, east] = [getValues("north"), getValues("east")];
    if (north != null && east != null) {
      const parsedNorth = parseFloat(north.toString());
      const parsedEast = parseFloat(east.toString());
      if (!isNaN(parsedNorth) && !isNaN(parsedEast) && isFinite(parsedNorth) && isFinite(parsedEast)) {
        const transformedCoordinates = transform(
          [parsedEast, parsedNorth],
          selectedProjection,
          getCurrentProjection().getCode(),
        );
        centerOnCoordinate(transformedCoordinates[1], transformedCoordinates[0]);
        reset();
      }
    }
  };

  return (
    <Form onSubmit={handleSubmit(submitCoordinates)}>
      <InputContainer>
        <InputGroup>
          <Input
            type="text"
            inputMode="decimal"
            pattern={coordinateDecimalPattern.source}
            title={coordinateDecimalPatternHelperText}
            placeholder="Fyll inn koordinat ..."
            label="Øst"
            isRequired
            {...register("east", {
              validate: (value: number | null) =>
                (value !== null && value > norwayExtent[0] && value < norwayExtent[2]) ||
                "Koordinatet må være innenfor Norges bredde",
            })}
            validationError={{
              showError: !!errors.east,
              message: errors.east?.message ?? "",
            }}
          />
        </InputGroup>
        <InputGroup>
          <Input
            type="text"
            inputMode="decimal"
            pattern={coordinateDecimalPattern.source}
            title={coordinateDecimalPatternHelperText}
            placeholder="Fyll inn koordinat ..."
            label="Nord"
            isRequired
            {...register("north", {
              validate: (value: number | null) =>
                (value !== null && value > norwayExtent[1] && value < norwayExtent[3]) ||
                "Koordinatet må være innenfor Norges lengde",
            })}
            validationError={{
              showError: !!errors.north,
              message: errors.north?.message ?? "",
            }}
          />
        </InputGroup>
      </InputContainer>
      <Select
        value={selectedProjection}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setProjection(e.target.value)}
      >
        {projectionDefinitions.map((projection) => (
          <option value={projection.epsgCode} key={projection.epsgCode}>
            {projection.name}
          </option>
        ))}
      </Select>
      {selectedProjection !== getCurrentProjection().getCode() && (
        <Alert>
          <AlertIcon />
          Du har valgt et annet koordinatsystem enn hva kartet bruker. Koordinatene du har skrevet inn blir derfor
          transformert til kartet sitt koordinatsystem.
        </Alert>
      )}
      <SpacedRow>
        <Text>
          Nåværende kartprojeksjon er: <b>{getCurrentProjectionName(false)}</b>
        </Text>
        <Button type="submit" isDisabled={!isDirty}>
          Gå til koordinater
        </Button>
      </SpacedRow>
    </Form>
  );
};
