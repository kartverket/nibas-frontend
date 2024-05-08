import { useMemo } from "react";
import GrunnkretsRow from "./GrunnkretsRow";
import { useUtkast, useUtkastEntity } from "contexts/UtkastContext/UtkastContext";
import useSearch from "hooks/useSearch";
import { GrunnkretsResponse } from "types/api";
import { getIdFromEntity } from "utils/api";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { ModalPanel, PanelHeader, PanelProps } from "../../Panel";
import { KretsTable } from "../KretsTable";
import { useKommuneGrunnkretser } from "hooks/inndelinger/useGrunnkretser";
import Input from "components/Input";
import SortHeader from "../SortHeader";
import { useTableSort } from "../useTableSort";
import { orderBy } from "utils/list-utils";
import { Modal, ModalContent, ModalOverlay, Spinner } from "@kvib/react";
import { useInndelinger } from "contexts/InndelingerContext/InndelingerContext";
import useKommuner from "hooks/inndelinger/useKommuner";
import { inndelingResponseNavnToString } from "contexts/InndelingerContext/inndelinger-utils";

const GrunnkretsPanel = ({ isOpen }: PanelProps) => {
  const { utkast } = useUtkast();
  const { sortProperty, sortOrder, sortHeaderProps } = useTableSort<GrunnkretsResponse>(["nummer", "navn"]);
  const { closeOverlayModal } = useOverlayPanel();
  const { searchValue, setInputValue } = useSearch();
  const { currentlyEditedInndeling, selectedFylkeId, selectedFlatedataInndeling } = useInndelinger();
  const { kommuner } = useKommuner(selectedFylkeId);

  const kommuneId = currentlyEditedInndeling
    ? currentlyEditedInndeling.id
    : selectedFlatedataInndeling
      ? selectedFlatedataInndeling.id
      : null;
  const kommune = kommuner?.find((fetchedKommune) => fetchedKommune.id.lokalid.value === kommuneId);
  const { data: grunnkretserByKommune } = useKommuneGrunnkretser(kommuneId);
  const utkastGrunnkretser = useUtkastEntity(grunnkretserByKommune, "grunnkretsendringer") as
    | GrunnkretsResponse[]
    | undefined;

  const filteredGrunnkretser = useMemo(() => {
    if (!searchValue) return utkastGrunnkretser;

    return utkastGrunnkretser?.filter(
      (grunnkrets) =>
        grunnkrets.nummer.includes(searchValue) || grunnkrets.navn.toLowerCase().includes(searchValue.toLowerCase()),
    );
  }, [searchValue, utkastGrunnkretser]);

  return (
    <Modal isOpen={isOpen} onClose={closeOverlayModal} scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent as={ModalPanel} $isOpen={isOpen}>
        {kommune && filteredGrunnkretser ? (
          <>
            <PanelHeader onClose={closeOverlayModal}>
              Flateinformasjon for {inndelingResponseNavnToString(kommune.navn)}
            </PanelHeader>
            <KretsTable $hasUtkast={utkast != null}>
              <thead>
                <tr>
                  <SortHeader {...sortHeaderProps("nummer")}>Grunnkretsnummer</SortHeader>
                  <SortHeader {...sortHeaderProps("navn")}>Grunnkretsnavn</SortHeader>
                  {utkast && <th>{/* Tom plass for mellomrom */}</th>}
                  <th>
                    <Input placeholder="Søk på navn" onChange={(e) => setInputValue(e.currentTarget.value)} />
                  </th>
                </tr>
              </thead>
              <tbody>
                {orderBy(filteredGrunnkretser, sortProperty, sortOrder).map((grunnkrets) => (
                  <GrunnkretsRow
                    key={getIdFromEntity(grunnkrets)}
                    grunnkrets={grunnkrets}
                    kommuneId={kommuneId ?? ""}
                  />
                ))}
              </tbody>
            </KretsTable>
          </>
        ) : (
          <Spinner />
        )}
      </ModalContent>
    </Modal>
  );
};

export default GrunnkretsPanel;
