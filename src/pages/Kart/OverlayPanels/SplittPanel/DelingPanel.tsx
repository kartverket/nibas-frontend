import { Button, ButtonGroup, FormControl, FormLabel, Heading, IconButton, Input, Select, Stack } from "@kvib/react";
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

export const DelingPanel = ({ isOpen, className }: PanelProps) => {
  const { flatedata, closeOverlayPanel } = useOverlayPanel();
  const {
    editingType,
    opprinneligFlateOptions,
    fields,
    register,
    append,
    remove,
    canSubmit,
    reset,
    updateDraftWithDelingRequest,
    getValues,
    handleOpprinneligKretsChange,
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
          <Stack spacing={4}>
            <Heading as="h3" size="sm">{`Hva skal ${fields[0].kretsNavn} deles til?`}</Heading>
            {fields.map((field, index) => (
              <NyKretsField key={field.id}>
                <FormControl>
                  <FormLabel>Nytt nummer</FormLabel>
                  <Input disabled={index === 0} type="number" {...register(`nyeKretser.${index}.kretsNummer`)} />
                </FormControl>
                <FormControl>
                  <FormLabel>Nytt navn</FormLabel>
                  <Input disabled={index === 0} {...register(`nyeKretser.${index}.kretsNavn`)} />
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
            ))}
            <Button onClick={() => append({ kretsNavn: "", kretsNummer: "" })} variant={"secondary"} leftIcon={"add"}>
              Legg til ny del
            </Button>
          </Stack>
        )}

        <ButtonGroup alignSelf={"flex-end"}>
          <Button variant="tertiary" onClick={closeAndResetForm}>
            Avbryt
          </Button>
          <Button onClick={updateDraftWithDelingRequest} isDisabled={!canSubmit()}>
            Del
          </Button>
        </ButtonGroup>
      </Stack>
    </SidePanel>
  );
};
