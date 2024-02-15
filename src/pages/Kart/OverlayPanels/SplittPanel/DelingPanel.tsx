import { PanelHeader, PanelProps, SidePanel } from "../Panel";
import { Button, ButtonGroup, FormControl, FormLabel, Heading, IconButton, Input, Select, Stack } from "@kvib/react";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { styled } from "styled-components";
import { CustomOption } from "../hooks/tilhorighetUtils";
import { getCurrentDelingOnKrets, getDefaultDelingValue, useDelingForm } from "./useDelingForm";

const NyKretsField = styled.div`
  display: flex;
  column-gap: 12px;
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
    isDirty,
    isValid,
    reset,
    updateDraftWithDelingEntry,
    setValue,
  } = useDelingForm(flatedata);

  const handleOpprinneligKretsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue("opprinneligKrets.lokalId", e.target.value, { shouldDirty: true, shouldValidate: true });
    /*if (!fields.find((field) => field.kretsNummer === "nummer")) {
      append({ kretsNummer: "nummer", kretsNavn: "opprinneligKretsNavn" });
    }*/
  };

  const closeAndResetForm = () => {
    closeOverlayPanel();
    reset(/* getCurrentDelingOnKrets() ?? */ getDefaultDelingValue());
  };

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
          <Select {...register("opprinneligKrets.lokalId")}>
            <option value={CustomOption.NOT_CHOSEN}>{`Velg ${editingType}`}</option>
            {opprinneligFlateOptions?.map((krets) => (
              <option
                value={krets.id.lokalid.value}
                key={krets.id.lokalid.value}
              >{`${krets.nummer} ${krets.navn}`}</option>
            ))}
          </Select>
        </FormControl>
        <Stack spacing={4}>
          <Heading as="h3" size="sm">{`Hva skal <${editingType}> deles til?`}</Heading>
          {fields.map((field, index) => (
            <NyKretsField key={field.id}>
              <FormControl>
                <Input type="number" placeholder={"Nytt nummer"} {...register(`nyeKretser.${index}.kretsNummer`)} />
              </FormControl>
              <FormControl>
                <Input placeholder={"Nytt navn"} {...register(`nyeKretser.${index}.kretsNavn`)} />
              </FormControl>

              <IconButton
                onClick={() => remove(index)}
                aria-label={"fjern del"}
                icon={"close"}
                variant={"tertiary"}
                alignSelf={"flex-end"}
              />
            </NyKretsField>
          ))}
          <Button onClick={() => append({ kretsNavn: "", kretsNummer: "" })} variant={"secondary"} leftIcon={"add"}>
            Legg til ny del
          </Button>
        </Stack>
        <Stack spacing={4}>
          <Heading as="h3" size="sm">{`Resultat etter deling av  <${editingType}>`}</Heading>
        </Stack>
        <ButtonGroup alignSelf={"flex-end"}>
          <Button variant="tertiary" onClick={closeAndResetForm}>
            Avbryt
          </Button>
          <Button onClick={updateDraftWithDelingEntry} isDisabled={!isDirty && isValid}>
            Del
          </Button>
        </ButtonGroup>
      </Stack>
    </SidePanel>
  );
};
