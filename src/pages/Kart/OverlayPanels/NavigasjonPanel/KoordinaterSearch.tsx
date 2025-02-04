import { Alert, AlertIcon, Button, FormControl, FormErrorMessage, FormLabel, InputGroup, Select } from "@kvib/react";
import Input from "components/Input";
import useNibasApi from "hooks/useNibasApi";
import { getLabelsFromProjection } from "pages/Kart/Kartinformasjon";
import { useState } from "react";
import { ChangeHandler, useForm } from "react-hook-form";
import { styled } from "styled-components";
import { EPSGCode, mapProjectionEPSGCode, projectionDefinitions } from "utils/map/projections";
import { centerOnCoordinate, SearchProps } from "./NavigasjonPanel";
import {
  decimalCoordinatePattern,
  dmsCoordinatePattern,
  isPointInsideMultiPolygon,
  transformCoordinatesToProjection,
} from "./koordinater-utils";
import { useValgtGyldighetsdato } from "contexts/GyldighetsdatoContext";

const StyledFormControl = styled(FormControl)`
  display: flex;
  flex-direction: column;
`;

const InputContainer = styled.div`
  display: flex;
  column-gap: 16px;
  margin: 22px 0 28px;
`;

const CoordinatesAlert = styled(Alert)`
  margin-top: 8px;
`;

const StyledFormErrorMessage = styled(FormErrorMessage)`
  grid-column: 1 / -2;
`;

const StyledButton = styled(Button)`
  align-self: flex-end;
`;

type KoordinaterForm = {
  north: number | null;
  east: number | null;
  globalErrorDummyField: null;
};

export const KoordinaterSearch = ({ onSearchSuccess }: SearchProps) => {
  // dette er projeksjonen brukeren sier at de gir koordinatene på
  const [projectionOfCoordinates, setProjectionOfCoordinates] = useState<EPSGCode>(mapProjectionEPSGCode);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { isDirty, errors: formErrors },
  } = useForm<KoordinaterForm>({
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: { north: null, east: null, globalErrorDummyField: null },
  });

  const { gyldighetsdato } = useValgtGyldighetsdato();
  const { data: nasjon, isLoading, error: nasjonFetchError } = useNibasApi("/v1/nasjon/", { gyldighetsdato });

  const validatePointInsideMultiPolygon = (north: number | null, east: number | null) => {
    if (nasjonFetchError != null || isLoading) {
      return true;
    }
    return (
      !isLoading &&
      east !== null &&
      north !== null &&
      nasjon?.omraade?.coordinates != null &&
      isPointInsideMultiPolygon(east, north, nasjon?.omraade?.coordinates)
    );
  };

  const gotoCoordinates = ({ north, east }: KoordinaterForm) => {
    if (north != null && east != null) {
      const transformedCoordinates = transformCoordinatesToProjection(
        east,
        north,
        projectionOfCoordinates,
        mapProjectionEPSGCode,
      );
      if (transformedCoordinates != null) {
        if (validatePointInsideMultiPolygon(transformedCoordinates[1], transformedCoordinates[0])) {
          centerOnCoordinate(transformedCoordinates[1], transformedCoordinates[0]);
          onSearchSuccess();
          reset();
          return true;
        }
        setError("globalErrorDummyField", { message: "Koordinatene må være innenfor Norge sine grenser" });
        return false;
      } else {
        setError("globalErrorDummyField", {
          message: "Koordinatene er ikke på samme format. Benytt enten desimaltall eller DMS-format (00°00'00\")",
        });
        return false;
      }
    }
  };

  const coordinateFieldValidator = {
    required: `Du må skrive inn et koordinat`,
    pattern: {
      value: new RegExp(`(${decimalCoordinatePattern.source})|(${dmsCoordinatePattern.source})`),
      message:
        "Koordinatet er ikke skrevet på et gyldig format. Benytt enten desimaltall eller DMS-format (00°00'00\")",
    },
  };

  const registerWithClearErrorsOnChange = (field: keyof KoordinaterForm) => {
    const { onChange, ...rest } = register(field, coordinateFieldValidator);
    const handleOnChange: ChangeHandler = (value) => {
      clearErrors(field);
      clearErrors("globalErrorDummyField");
      return onChange(value);
    };

    return {
      onChange: handleOnChange,
      ...rest,
    };
  };

  return (
    <form onSubmit={handleSubmit(gotoCoordinates)}>
      <StyledFormControl isInvalid={formErrors.globalErrorDummyField != null}>
        <FormLabel htmlFor="select">Koordinatsystem</FormLabel>
        <Select
          isInvalid={false}
          value={projectionOfCoordinates}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setProjectionOfCoordinates(e.target.value as EPSGCode)}
        >
          {projectionDefinitions.map((projection) => (
            <option value={projection.epsgCode} key={projection.epsgCode}>
              {projection.name}
            </option>
          ))}
        </Select>
        {projectionOfCoordinates !== mapProjectionEPSGCode && (
          <CoordinatesAlert>
            <AlertIcon />
            Du har valgt et annet koordinatsystem enn hva kartet bruker. Koordinatene du har skrevet inn blir derfor
            transformert til kartet sitt koordinatsystem.
          </CoordinatesAlert>
        )}
        <InputContainer>
          <InputGroup>
            <Input
              type="text"
              placeholder="Fyll inn koordinat ..."
              label={getLabelsFromProjection(projectionOfCoordinates).x ?? ""}
              {...registerWithClearErrorsOnChange("east")}
              validationError={{
                showError: !!formErrors.east,
                message: formErrors.east?.message ?? "",
              }}
            />
          </InputGroup>
          {formErrors.east != null && <StyledFormErrorMessage>{formErrors.east.message}</StyledFormErrorMessage>}

          <InputGroup>
            <Input
              type="text"
              placeholder="Fyll inn koordinat ..."
              label={getLabelsFromProjection(projectionOfCoordinates).y ?? ""}
              {...registerWithClearErrorsOnChange("north")}
              validationError={{
                showError: !!formErrors.north,
                message: formErrors.north?.message ?? "",
              }}
            />
          </InputGroup>
          {formErrors.north != null && <StyledFormErrorMessage>{formErrors.north.message}</StyledFormErrorMessage>}
        </InputContainer>
        {formErrors.globalErrorDummyField != null && (
          <StyledFormErrorMessage>{formErrors.globalErrorDummyField.message}</StyledFormErrorMessage>
        )}

        <StyledButton type="submit" isDisabled={!isDirty}>
          Gå til koordinater
        </StyledButton>
      </StyledFormControl>
    </form>
  );
};
