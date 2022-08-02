import { useEffect } from "react";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import { updateStemmekrets } from "api/enheter";
import Button from "components/form/Button";
import Input from "components/form/Input";
import useNibasApi from "hooks/useNibasApi";
import {
  StemmekretsRef,
  StemmekretsRequest,
  StemmekretsResponse,
} from "types/api";

type Inputs = {
  stemmekretsnavn: string;
  stemmekretsnummer: string;
  tellekretsnavn: string;
  tellekretsnummer: string;
};

const fromFormToRequest = (
  data: Inputs,
  stemmekrets: StemmekretsResponse
): StemmekretsRequest => ({
  identifikasjon: stemmekrets.identifikasjon,
  valgdistriktsnummer: stemmekrets.valgdistriktsnummer,
  stemmekretsnavn: data.stemmekretsnavn,
  stemmekretsnummer: data.stemmekretsnummer,
  tellekretsnavn: data.tellekretsnavn,
  tellekretsnummer: data.tellekretsnummer,
});

type Props = {
  stemmekrets: StemmekretsRef;
  postSubmit: (StemmekretsId: string) => void;
};

const EditRow = ({ stemmekrets, postSubmit }: Props) => {
  const { tokenHolderFunc } = useAuthenticationFlow();
  const { data: fullStemmekrets, mutate } = useNibasApi(
    "/v1/stemmekretser/{id}",
    {
      id: stemmekrets.id,
    }
  );

  const { register, handleSubmit, setValue } = useForm<Inputs>();

  useEffect(() => {
    if (!fullStemmekrets) return;

    setValue("stemmekretsnavn", fullStemmekrets.stemmekretsnavn);
    setValue("stemmekretsnummer", fullStemmekrets.stemmekretsnummer);
    setValue("tellekretsnavn", fullStemmekrets.tellekretsnavn ?? "");
    setValue("tellekretsnummer", fullStemmekrets.tellekretsnummer ?? "");
  }, [fullStemmekrets, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    if (!fullStemmekrets) return;

    await updateStemmekrets(
      fromFormToRequest(data, fullStemmekrets),
      stemmekrets.id,
      tokenHolderFunc()?.token
    );

    mutate();
    postSubmit(stemmekrets.id);
  });

  return (
    <AccordionRow>
      <td>
        <Input {...register("stemmekretsnavn")} />
      </td>
      <td>
        <Input {...register("stemmekretsnummer")} />
      </td>
      <td>
        <Input {...register("tellekretsnavn")} />
      </td>
      <td>
        <Input {...register("tellekretsnummer")} />
      </td>
      <td>
        <Button onClick={onSubmit}>Lagre</Button>
      </td>
    </AccordionRow>
  );
};

const AccordionRow = styled.tr`
  background-color: ${({ theme }) => theme.colors.blueLight};

  &:nth-child(2n - 1) {
    background-color: ${({ theme }) => theme.colors.white};
  }

  td {
    padding: 8px;
  }
`;

export default EditRow;
