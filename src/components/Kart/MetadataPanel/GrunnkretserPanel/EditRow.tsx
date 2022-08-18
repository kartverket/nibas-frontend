import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
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
  updateDraft: (id: string, grunnkrets: GrunnkretsRequest) => void;
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

const EditRow = ({ grunnkrets, updateDraft }: Props) => {
  const { t } = useTranslation();
  const { data: fullGrunnkrets } = useNibasApi("/v1/grunnkretser/{id}", {
    id: grunnkrets.id,
  });

  const { register, getValues } = useForm<Inputs>({
    defaultValues: {
      grunnkretsnummer: grunnkrets.grunnkretsnummer,
      navn: getNavnInSpraak(grunnkrets.navn, "nor"),
    },
  });

  const updateDraftOnBlur = () => {
    if (!fullGrunnkrets) return;

    updateDraft(
      fullGrunnkrets.id,
      fromFormToRequest(getValues(), fullGrunnkrets)
    );
  };

  const registerOptions = {
    onBlur: updateDraftOnBlur,
  };

  return (
    <AccordionRow>
      <td colSpan={3}>
        <InputsWrapper>
          <BlockLabel>
            {t("grunnkrets.Grunnkretsnummer")}
            <Input {...register("grunnkretsnummer", registerOptions)} />
          </BlockLabel>
          <BlockLabel>
            {t("tabell.Navn")}
            <Input {...register("navn", registerOptions)} />
          </BlockLabel>
        </InputsWrapper>
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
      flex: 1;
    }

    &:last-child {
      flex: 3;
    }
  }
`;

export default EditRow;
