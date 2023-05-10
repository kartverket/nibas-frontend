import styled from "styled-components";
import { StemmekretsRef, StemmekretsResponse } from "types/api";
import DetailsTab from "./DetailsTab";
import { useUtkastEntity } from "contexts/UtkastContext";
import useNibasApi from "hooks/useNibasApi";
import { getIdFromEntity } from "utils/api";

type Props = {
  stemmekrets: StemmekretsRef;
  kommuneId: string;
};

const EditRow = ({ stemmekrets, kommuneId }: Props) => {
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
        <DetailsTab
          stemmekretsId={stemmekretsId}
          kommuneId={kommuneId}
          utkastStemmekrets={utkastStemmekrets}
        />
      </td>
    </AccordionRow>
  );
};

const AccordionRow = styled.tr`
  td {
    padding: 0;
  }
`;

export default EditRow;
