import {
  Button,
  ButtonGroup,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  IconButton,
  Input,
  Select,
  Stack,
} from "@kvib/react";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { styled } from "styled-components";
import { PanelHeader, PanelProps, SidePanel } from "../Panel";
import { CustomOption } from "../hooks/tilhorighetUtils";
import { getDefaultDelingValue, useDelingForm } from "./useDelingForm";

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
  --form-error-color: var(--kvib-colors-red-500);
  color: var(--form-error-color);
  margin-top: var(--kvib-space-2);
  font-size: var(--kvib-fontSizes-sm);
  line-height: var(--kvib-lineHeights-normal);
  background: var(--kvib-colors-red-50);
  padding: 8px;
  border: 2px var(--kvib-colors-red-100) solid;
  border-radius: 8px;
  gap: 5px;
`;

export const DelingPanel = ({ isOpen, className }: PanelProps) => {
  const { flatedata, closeOverlayPanel } = useOverlayPanel();
  const {
    editingType,
    opprinneligFlateOptions,
    fields,
    register,
    append,
    remove,
    reset,
    updateDraftWithDelingRequest,
    getValues,
    handleOpprinneligKretsChange,
    handleSubmit,
    errors,
  } = useDelingForm(flatedata);

  const closeAndResetForm = () => {
    closeOverlayPanel();
    reset(getDefaultDelingValue());
  };

  const opprinneligKretsRegister = register("opprinneligKrets.lokalId");

  return (
    <SidePanel $isOpen={isOpen} className={className}>
      <PanelHeader
        onClose={closeAndResetForm}
        subHeading={`Ved å dele en flate kan du opprette en eller flere nye flater`}
      >
        Del en flate
      </PanelHeader>

      <Stack spacing={8}>
        <Heading as="h3" size="sm">
          {`Hvilken ${editingType} skal deles?`}
        </Heading>
        <FormControl>
          <FormLabel>
            {editingType
              ?.charAt(0)
              .toUpperCase()
              .concat(editingType?.slice(1))}
          </FormLabel>
          <Select
            {...opprinneligKretsRegister}
            onChange={(e) => {
              opprinneligKretsRegister.onChange(e);
              handleOpprinneligKretsChange(e);
            }}
          >
            <option value={CustomOption.NOT_CHOSEN}>{`Velg ${editingType}`}</option>
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
              <Heading as="h3" size="sm">{`Hva skal ${fields[0].kretsNavn} deles til?`}</Heading>
              {fields.map((field, index) => (
                <div key={field.id}>
                  <NyKretsField>
                    <FormControl isInvalid={!!errors.nyeKretser?.[index]?.kretsNummer}>
                      <FormLabel>Nytt nummer</FormLabel>
                      <Input
                        disabled={index === 0}
                        type="number"
                        {...register(`nyeKretser.${index}.kretsNummer`, {
                          required: `Ny ${editingType} må ha et nummer`,
                        })}
                      />
                    </FormControl>
                    <FormControl isInvalid={!!errors.nyeKretser?.[index]?.kretsNavn}>
                      <FormLabel>Nytt navn</FormLabel>
                      <Input
                        disabled={index === 0}
                        {...register(`nyeKretser.${index}.kretsNavn`, { required: `Ny ${editingType} må ha et navn` })}
                      />
                    </FormControl>
                    {index !== 0 ? (
                      <IconButton
                        onClick={() => remove(index)}
                        aria-label={"fjern del"}
                        icon={"close"}
                        variant={"tertiary"}
                        alignSelf={"flex-end"}
                      />
                    ) : (
                      <FillerDiv />
                    )}
                  </NyKretsField>
                  {!!errors.nyeKretser?.[index] && (
                    <CustomFormErrorMessage>
                      <Icon icon={"error"} />
                      {[
                        errors.nyeKretser?.[index]?.kretsNavn?.message,
                        errors.nyeKretser?.[index]?.kretsNummer?.message,
                      ]
                        .filter((e) => e !== undefined)
                        .join(". ")}
                    </CustomFormErrorMessage>
                  )}
                </div>
              ))}
              <Button onClick={() => append({ kretsNavn: "", kretsNummer: "" })} variant={"secondary"} leftIcon={"add"}>
                Legg til ny del
              </Button>
            </Stack>
            <ButtonGroup alignSelf={"flex-end"}>
              <Button variant="tertiary" onClick={closeAndResetForm}>
                Avbryt
              </Button>
              <Button
                onClick={handleSubmit(updateDraftWithDelingRequest)}
                isDisabled={getValues("nyeKretser").slice(1).length < 1}
              >
                Del
              </Button>
            </ButtonGroup>
          </>
        )}
      </Stack>
    </SidePanel>
  );
};
