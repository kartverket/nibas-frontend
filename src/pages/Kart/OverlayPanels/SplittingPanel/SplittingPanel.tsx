import {
  Button,
  ButtonGroup,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  IconButton,
  Input,
  InputProps,
  Select,
  Stack,
} from "@kvib/react";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { styled } from "styled-components";
import { PanelHeader, PanelProps, SidePanel } from "../Panel";
import { CustomOption } from "../hooks/tilhorighet-utils";
import { ChangeEvent, useEffect } from "react";
import { useSplittingForm } from "./useSplittingForm";
import { useInndelinger } from "contexts/InndelingerContext/InndelingerContext";

const NyKretsField = styled.div`
  display: flex;
  column-gap: 12px;
`;

const FillerDiv = styled.div`
  min-width: 40px;
  min-height: 40px;
`;

const CustomFormErrorMessage = styled.div`
  display: flex;
  align-items: center;
  color: var(--kvib-colors-red-500);
  margin-top: var(--kvib-space-2);
  font-size: var(--kvib-fontSizes-sm);
  line-height: var(--kvib-lineHeights-normal);
  background: var(--kvib-colors-red-50);
  padding: 8px;
  border: 2px var(--kvib-colors-red-100) solid;
  border-radius: 8px;
  gap: 25px;
`;

const StyledButtonGroup = styled(ButtonGroup)`
  align-self: flex-end;
`;

const StyledList = styled.ul`
  list-style-type: none;
`;

export const SplittingPanel = ({ isOpen }: PanelProps) => {
  const { closeOverlayPanel } = useOverlayPanel();
  const { currentlyEditingInndelinger } = useInndelinger();
  const {
    inndelingtype,
    opprinneligFlateOptions,
    fields,
    register,
    append,
    remove,
    resetSplitting,
    updateDraftWithSplittingRequest,
    getValues,
    handleOpprinneligKretsChange,
    handleSubmit,
    errors,
    trigger,
    isSubmitted,
  } = useSplittingForm(currentlyEditingInndelinger[0]);

  useEffect(() => {
    resetSplitting();
  }, [currentlyEditingInndelinger, resetSplitting]); // Vi ønsker å kalle reset hvis vi bytter inndeling

  const closeAndResetForm = () => {
    closeOverlayPanel();
    resetSplitting();
  };

  const validateNotDuplicateKretsnummer = (value: string) => {
    const conflictingKrets = opprinneligFlateOptions.find((krets) => krets.nummer === value);
    if (conflictingKrets) {
      return `Nytt ${inndelingtype}nummer er allerede i bruk av ${conflictingKrets.nummer} ${conflictingKrets.navn}`;
    }

    const nyeKretsNummere = getValues("nyeKretser").map((k) => k.kretsNummer);
    const indexOfCurrentNummer = nyeKretsNummere.findIndex((n) => n === value);
    nyeKretsNummere.splice(indexOfCurrentNummer, 1); // fjerner value fra lista
    if (nyeKretsNummere.includes(value)) {
      // hvis et nummer lik value fremdeles er i lista har vi duplikat for value
      return `Nytt ${inndelingtype}nummer er allerede i bruk i denne splittingen`;
    }

    return true;
  };

  const kretsNumberValidator = {
    required: `Ny ${inndelingtype} må ha et nummer`,
    pattern: {
      value: /^\d+$/,
      message: `Nytt ${inndelingtype}nummer må være et gyldig positivt tall`,
    },
    minValue: {
      value: 1,
      message: `Nytt ${inndelingtype}nummer må være et gyldig positivt tall`,
    },
    minLength: {
      value: inndelingtype === "stemmekrets" ? 1 : 8,
      message: `Nytt ${inndelingtype}nummer må være ${
        inndelingtype === "stemmekrets" ? "minst 1 tegn langt" : "nøyaktig 8 tegn langt"
      }`,
    },
    maxLength: {
      value: inndelingtype === "stemmekrets" ? 4 : 8,
      message: `Nytt ${inndelingtype}nummer kan ikke være lengre enn ${inndelingtype === "stemmekrets" ? 4 : 8} tegn`,
    },
    validate: validateNotDuplicateKretsnummer,
  };

  const triggerRevalidateOnChangeAfterSubmit = ({ onChange, ...restProps }: InputProps) => {
    return {
      onChange: (e: ChangeEvent<HTMLInputElement>) => {
        if (onChange) {
          onChange(e);
        }
        if (isSubmitted === true) {
          trigger();
        }
      },
      ...restProps,
    };
  };

  const opprinneligKretsRegister = register("opprinneligKrets.lokalId");

  return (
    <SidePanel $isOpen={isOpen}>
      <PanelHeader
        onClose={closeAndResetForm}
        subHeading="Ved å splitte en flate kan du opprette en eller flere nye flater"
      >
        Splitt en flate
      </PanelHeader>

      <Stack spacing={8}>
        <FormControl>
          <FormLabel>{`Hvilken ${inndelingtype} skal splittes?`}</FormLabel>
          <Select
            {...opprinneligKretsRegister}
            onChange={(e) => {
              opprinneligKretsRegister.onChange(e);
              handleOpprinneligKretsChange(e);
            }}
          >
            <option value={CustomOption.NOT_CHOSEN}>{`Velg ${inndelingtype}`}</option>
            {opprinneligFlateOptions?.map((krets) => (
              <option
                value={krets.id.lokalid.value}
                key={krets.id.lokalid.value}
              >{`${krets.nummer} ${krets.navn}`}</option>
            ))}
          </Select>
        </FormControl>

        {getValues("opprinneligKrets.lokalId") !== CustomOption.NOT_CHOSEN && (
          <>
            <Stack spacing={4}>
              <Heading as="h3" size="sm">{`Hva skal ${fields[0].kretsNavn} splittes til?`}</Heading>
              {fields.map((field, index) => (
                <div key={field.id}>
                  <NyKretsField>
                    <FormControl isInvalid={!!errors.nyeKretser?.[index]?.kretsNummer}>
                      {index !== 0 && <FormLabel>Nytt nummer</FormLabel>}
                      <Input
                        disabled={index === 0}
                        type="number"
                        {...triggerRevalidateOnChangeAfterSubmit(
                          register(`nyeKretser.${index}.kretsNummer`, index !== 0 ? kretsNumberValidator : {}),
                        )}
                      />
                    </FormControl>
                    <FormControl isInvalid={!!errors.nyeKretser?.[index]?.kretsNavn}>
                      {index !== 0 && <FormLabel>Nytt navn</FormLabel>}
                      <Input
                        disabled={index === 0}
                        {...register(`nyeKretser.${index}.kretsNavn`, {
                          required: `Ny ${inndelingtype} må ha et navn`,
                        })}
                      />
                    </FormControl>
                    {index !== 0 ? (
                      <IconButton
                        onClick={() => {
                          remove(index);
                        }}
                        aria-label="fjern splitt"
                        icon="close"
                        variant="tertiary"
                        alignSelf="flex-end"
                      />
                    ) : (
                      <FillerDiv />
                    )}
                  </NyKretsField>
                  {!!errors.nyeKretser?.[index] && (
                    <CustomFormErrorMessage>
                      <Icon icon="error" />
                      <StyledList>
                        {[
                          errors.nyeKretser?.[index]?.kretsNavn?.message,
                          errors.nyeKretser?.[index]?.kretsNummer?.message,
                        ]
                          .filter((e) => e !== undefined)
                          .map((error, indexE) => (
                            <li key={indexE}>{error}</li>
                          ))}
                      </StyledList>
                    </CustomFormErrorMessage>
                  )}
                </div>
              ))}
              <Button onClick={() => append({ kretsNavn: "", kretsNummer: "" })} variant="secondary" leftIcon="add">
                Legg til ny splitt
              </Button>
            </Stack>
            <StyledButtonGroup>
              <Button variant="tertiary" onClick={closeAndResetForm}>
                Avbryt
              </Button>
              <Button
                onClick={handleSubmit(updateDraftWithSplittingRequest)}
                isDisabled={getValues("nyeKretser").slice(1).length < 1}
              >
                Splitt
              </Button>
            </StyledButtonGroup>
          </>
        )}
      </Stack>
    </SidePanel>
  );
};
