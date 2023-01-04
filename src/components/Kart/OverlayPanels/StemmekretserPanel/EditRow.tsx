import styled from "styled-components";
import { StemmekretsRef, StemmekretsResponse } from "types/api";
import Tabs from "components/Tabs";
import MergeTab from "./MergeTab";
import DetailsTab from "./DetailsTab";
import { useUtkastEntity } from "contexts/UtkastContext";
import useNibasApi from "hooks/useNibasApi";
import { getIdFromEntity } from "utils/api";

type Props = {
  stemmekrets: StemmekretsRef;
  kommuneId: string;
  alleStemmekretser: StemmekretsRef[];
};

const EditRow = ({ stemmekrets, kommuneId, alleStemmekretser }: Props) => {
  const stemmekretsId = getIdFromEntity(stemmekrets);

  const { data: fullStemmekrets } = useNibasApi("/v1/stemmekretser/{id}", {
    id: stemmekretsId,
  });

  const utkastStemmekrets = useUtkastEntity(
    fullStemmekrets,
    "stemmekretsendringer"
  ) as StemmekretsResponse | undefined;

  return (
    <AccordionRow>
      <td colSpan={7}>
        <Tabs tabTransKeys={["stemmekrets.Detaljer", "stemmekrets.Slå sammen"]}>
          <DetailsTab
            stemmekretsId={stemmekretsId}
            kommuneId={kommuneId}
            utkastStemmekrets={utkastStemmekrets}
          />
          <MergeTab
            stemmekrets={utkastStemmekrets}
            alleStemmekretser={alleStemmekretser}
          />
        </Tabs>
      </td>
    </AccordionRow>
  );
};

const AccordionRow = styled.tr`
  td {
    padding: 0;
  }
`;

export const Section = styled.div`
  background-color: var(--gray_light);
  padding: 30px 24px;
`;

export const ContrastSection = styled(Section)`
  background: var(--green_light);
  border: 2px solid var(--black);
  border-left: none;
  border-right: none;
`;

export const BlockLabel = styled.label`
  input {
    width: 100%;
  }

  margin-bottom: 16px;
`;

export const InputsWrapper = styled.div`
  display: flex;
  gap: 16px;
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
