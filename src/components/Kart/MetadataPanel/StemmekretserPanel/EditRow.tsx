import { useEffect } from "react";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
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
  postSubmit: (stemmekretsId: string) => void;
};

const EditRow = ({ stemmekrets, postSubmit }: Props) => {
  const { t } = useTranslation();
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
      <td colSpan={6}>
        <InputsWrapper>
          <BlockLabel>
            {t("stemmekrets.Stemmekretsnummer")}
            <Input {...register("stemmekretsnummer")} />
          </BlockLabel>

          <BlockLabel>
            {t("tabell.Navn")}
            <Input {...register("stemmekretsnavn")} />
          </BlockLabel>
        </InputsWrapper>

        <InputsWrapper>
          <BlockLabel>
            {t("stemmekrets.Tellekretsnummer")}
            <Input {...register("tellekretsnummer")} />
          </BlockLabel>

          <BlockLabel>
            {t("stemmekrets.Tellekretsnavn")}
            <Input {...register("tellekretsnavn")} />
          </BlockLabel>
        </InputsWrapper>

        <Button onClick={onSubmit}>{t("action.Lagre")}</Button>
      </td>
    </AccordionRow>
  );
};

const AccordionRow = styled.tr`
  background-color: ${({ theme }) => theme.colors.blueLight};

  td {
    padding: 8px;
  }
`;

const BlockLabel = styled.label`
  &:last-child {
    margin-left: 16px;
  }

  input {
    width: 100%;
  }

  margin-bottom: 16px;
`;

const InputsWrapper = styled.div`
  display: flex;
  width: 80%;

  > ${BlockLabel} {
    width: 100%;

    &:first-child {
      flex: 1;
    }

    &:last-child {
      flex: 3;
    }
  }
`;

export default EditRow;
