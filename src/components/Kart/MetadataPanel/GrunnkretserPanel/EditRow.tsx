import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import { updateGrunnkrets } from "api/enheter";
import Button from "components/form/Button";
import Input from "components/form/Input";
import useNibasApi from "hooks/useNibasApi";
import {
  GrunnkretsRef,
  GrunnkretsRequest,
  GrunnkretsResponse,
} from "types/api";
import { getNavnInSpraak } from "utils/language/language";

type Props = {
  grunnkrets: GrunnkretsRef;
  postSubmit: () => void;
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
    postSubmit();
  });

  return (
    <AccordionRow>
      <td>
        <Input {...register("navn")} />
      </td>
      <td>
        <Input {...register("grunnkretsnummer")} />
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
