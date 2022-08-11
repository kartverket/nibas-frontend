import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { updateGrunnkrets } from "api/enheter";
import Button from "components/form/Button";
import Input from "components/form/Input";
import Label from "components/form/Label";
import useNibasApi from "hooks/useNibasApi";
import {
  GrunnkretsRef,
  GrunnkretsRequest,
  GrunnkretsResponse,
} from "types/api";
import { getNavnInSpraak } from "utils/language/language";

type Props = {
  grunnkrets: GrunnkretsRef;
  postSubmit: (grunnkretsId: string) => void;
};

type Inputs = {
  navn: string;
  grunnkretsnummer: string;
};

const fromFormToRequest = (
  data: Inputs,
  grunnkrets: GrunnkretsResponse
): GrunnkretsRequest => ({
  identifikasjon: grunnkrets.identifikasjon,
  navn: data.navn,
  grunnkretsnummer: data.grunnkretsnummer,
});

const EditRow = ({ grunnkrets, postSubmit }: Props) => {
  const { t } = useTranslation();
  const { tokenHolderFunc } = useAuthenticationFlow();
  const { data: fullGrunnkrets, mutate } = useNibasApi(
    "/v1/grunnkretser/{id}",
    {
      id: grunnkrets.id,
    }
  );

  const { register, handleSubmit } = useForm<Inputs>({
    defaultValues: {
      grunnkretsnummer: grunnkrets.grunnkretsnummer,
      navn: getNavnInSpraak(grunnkrets.navn, "nor"),
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    if (!fullGrunnkrets) return;

    await updateGrunnkrets(
      fromFormToRequest(data, fullGrunnkrets),
      grunnkrets.id,
      tokenHolderFunc()?.token
    );

    mutate();
    postSubmit(grunnkrets.id);
  });

  return (
    <AccordionRow>
      <td colSpan={3}>
        <InputsWrapper>
          <BlockLabel>
            {t("tabell.Navn")}
            <Input {...register("navn")} />
          </BlockLabel>
          <BlockLabel>
            {t("grunnkrets.Grunnkretsnummer")}
            <Input {...register("grunnkretsnummer")} />
          </BlockLabel>
        </InputsWrapper>

        <Button onClick={onSubmit}>Lagre</Button>
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

const BlockLabel = styled(Label)`
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
  margin: auto;

  > ${BlockLabel} {
    width: 100%;

    &:first-child {
      flex: 2;
    }

    &:last-child {
      flex: 1;
    }
  }
`;

export default EditRow;
