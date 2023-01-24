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
        <Tabs tabTransKeys={["stemmekrets.Detaljer"]}>
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

export default EditRow;
