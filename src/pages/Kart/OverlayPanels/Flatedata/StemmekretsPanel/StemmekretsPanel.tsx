import { KretsTable } from "../KretsTable";
import StemmekretsRow from "./StemmekretsRow";
import { useUtkast, useUtkastEntity } from "contexts/UtkastContext/UtkastContext";
import { StemmekretsResponse } from "types/api";
import { getIdFromEntity } from "utils/api";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { PanelProps, PanelHeader, ModalPanel } from "../../Panel";
import { useKommuneStemmekretser } from "hooks/inndelinger/useStemmekretser";
import SortHeader from "../SortHeader";
import { useTableSort } from "../useTableSort";
import { orderBy } from "utils/list-utils";
import { Modal, ModalContent, ModalOverlay, Spinner } from "@kvib/react";
import { useInndelinger } from "contexts/InndelingerContext/InndelingerContext";
import useKommuner from "hooks/inndelinger/useKommuner";
import { inndelingResponseNavnToString } from "contexts/InndelingerContext/inndelinger-utils";

const StemmekretsPanel = ({ isOpen }: PanelProps) => {
  const { utkast } = useUtkast();
  const { sortProperty, sortOrder, sortHeaderProps } = useTableSort<StemmekretsResponse>([
    "nummer",
    "navn",
    "valgdistriktsnummer",
  ]);

  const { closeOverlayModal } = useOverlayPanel();
  const { currentlyEditedInndeling, selectedFlatedataInndeling, selectedFylkeId } = useInndelinger();
  const { kommuner } = useKommuner(selectedFylkeId);

  const kommuneId = currentlyEditedInndeling
    ? currentlyEditedInndeling.id
    : selectedFlatedataInndeling
      ? selectedFlatedataInndeling.id
      : null;
  const kommune = kommuner?.find((fetchedKommune) => fetchedKommune.id.lokalid.value === kommuneId);

  const { data: stemmekretserByKommune } = useKommuneStemmekretser(kommuneId);
  const utkastStemmekretser = useUtkastEntity(stemmekretserByKommune, "stemmekretsendringer") as
    | StemmekretsResponse[]
    | undefined;

  return (
    <Modal isOpen={isOpen} onClose={closeOverlayModal} scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent as={ModalPanel} $isOpen={isOpen}>
        {utkastStemmekretser && kommune ? (
          <>
            <PanelHeader onClose={closeOverlayModal}>
              Flateinformasjon for {inndelingResponseNavnToString(kommune.navn)}
            </PanelHeader>
            <KretsTable $hasUtkast={utkast != null}>
              <thead>
                <tr>
                  <SortHeader {...sortHeaderProps("nummer")}>Stemmekretsnummer</SortHeader>
                  <SortHeader {...sortHeaderProps("navn")}>Stemmekretsnavn</SortHeader>
                  <SortHeader {...sortHeaderProps("valgdistriktsnummer")}>Valgdistriktsnummer</SortHeader>
                  {utkast && <th>{/* Tom plass for knapp i rader */}</th>}
                </tr>
              </thead>
              <tbody>
                {orderBy(utkastStemmekretser, sortProperty, sortOrder).map((stemmekrets) => (
                  <StemmekretsRow
                    key={getIdFromEntity(stemmekrets)}
                    stemmekrets={stemmekrets}
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

export default StemmekretsPanel;
