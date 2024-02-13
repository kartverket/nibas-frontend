import { Button, ButtonGroup, FormControl, FormLabel, Heading, Input, Select, Stack } from "@kvib/react";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { IdentifikatorMedVersjon } from "types/api";
import { useSplitForm } from "./useSplitForm";
import styled from "styled-components";
import { CustomOption } from "../hooks/tilhorighetUtils";

export const SplitForm = () => {
  const { flatedata, closeOverlayPanel } = useOverlayPanel();
  const {
    editingType,
    opprinneligFlateOptions,
    fields,
    register,
    append,
    remove,
    isDirty,
    reset,
    updateDraftWithSplitEntry,
    setValue,
  } = useSplitForm(flatedata);

  const handleOpprinneligKretsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedKretsIdentifikatorMedVersjon = JSON.parse(e.target.value) as IdentifikatorMedVersjon;
    setValue("opprinneligKrets", selectedKretsIdentifikatorMedVersjon, { shouldDirty: true });
  };

  const NyKretsField = styled.div`
    display: flex;
    justify-content: space-between;
  `;

  return (
    <Stack spacing={8}>
      <Heading as="h3" size="sm">
        {`Hvilken ${editingType} skal splittes?`}
      </Heading>
      <FormControl>
        <FormLabel>
          {editingType
            ?.charAt(0)
            .toUpperCase()
            .concat(editingType?.slice(1))}
        </FormLabel>
        <Select onChange={handleOpprinneligKretsChange}>
          <option value={CustomOption.NOT_CHOSEN}>{`Velg ${editingType}`}</option>
          {opprinneligFlateOptions?.map((krets) => (
            <option
              value={JSON.stringify({
                lokalId: krets.id.lokalid.value,
                version: krets.version,
              })}
              key={krets.id.lokalid.value}
            >{`${krets.nummer} ${krets.navn}`}</option>
          ))}
        </Select>
      </FormControl>
      <Stack spacing={4}>
        <Heading as="h3" size="sm">{`Hva skal ${editingType}en splittes til?`}</Heading>
        {fields.map((field, index) => (
          <NyKretsField key={field.id}>
            <FormControl>
              <FormLabel>Nytt nummer</FormLabel>
              <Input {...register(`nyeKretser.${index}.kretsNummer`)} />
            </FormControl>
            <FormControl>
              <FormLabel>Nytt navn</FormLabel>
              <Input {...register(`nyeKretser.${index}.kretsNavn`)} />
            </FormControl>
          </NyKretsField>
        ))}
        <Button onClick={() => append({ kretsNavn: "", kretsNummer: "" })}></Button>
      </Stack>
      <ButtonGroup alignSelf={"flex-end"}>
        <Button
          variant="tertiary"
          onClick={() => {
            closeOverlayPanel();
            reset();
          }}
        >
          Avbryt
        </Button>
        <Button onClick={updateDraftWithSplitEntry} isDisabled={!isDirty}>
          Splitt
        </Button>
      </ButtonGroup>
    </Stack>
  );
};
