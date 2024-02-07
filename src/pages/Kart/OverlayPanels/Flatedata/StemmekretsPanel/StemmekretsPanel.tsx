import { KretsTable } from "../KretsTable";
import StemmekretsRow from "./StemmekretsRow";
import { useUtkast, useUtkastEntity } from "contexts/UtkastContext";
import { StemmekretsResponse } from "types/api";
import { getIdFromEntity } from "utils/api";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { PanelProps, PanelHeader, ModalPanel } from "../../Panel";
import { useKommuneStemmekretser } from "hooks/inndelinger/useStemmekretser";
import SortHeader from "../SortHeader";
import { useTableSort } from "../useTableSort";
import { orderBy } from "utils/list-utils";
import { getNavnInSpraak } from "utils/language/language";
import { Modal, ModalContent, ModalOverlay, Spinner } from "@kvib/react";

const StemmekretsPanel = ({ isOpen, className }: PanelProps) => {
  const { utkast } = useUtkast();
  const { sortProperty, sortOrder, sortHeaderProps } = useTableSort([
    "stemmekretsnummer",
    "stemmekretsnavn",
    "valgdistriktsnummer",
  ]);

  const { flatedata, closeOverlayModal } = useOverlayPanel();
  const kommuneId = flatedata ? getIdFromEntity(flatedata) : "";
  const { data: stemmekretserByKommune } = useKommuneStemmekretser(kommuneId);
  const utkastStemmekretser = useUtkastEntity(stemmekretserByKommune, "stemmekretsendringer") as
    | StemmekretsResponse[]
    | undefined;

  return (
    <Modal isOpen={isOpen} onClose={closeOverlayModal} scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent as={ModalPanel} $isOpen={isOpen} className={className}>
        <PanelHeader onClose={closeOverlayModal}>
          Flateinformasjon for {getNavnInSpraak(flatedata?.navn, "nor")}
        </PanelHeader>
        {utkastStemmekretser ? (
          <KretsTable $hasUtkast={utkast !== undefined}>
            <thead>
              <tr>
                <SortHeader {...sortHeaderProps("stemmekretsnummer")}>Stemmekretsnummer</SortHeader>
                <SortHeader {...sortHeaderProps("stemmekretsnavn")}>Stemmekretsnavn</SortHeader>
                <SortHeader {...sortHeaderProps("valgdistriktsnummer")}>Valgdistriktsnummer</SortHeader>
                {utkast && <th>{/* Tom plass for knapp i rader */}</th>}
              </tr>
            </thead>
            <tbody>
              {orderBy(utkastStemmekretser, sortProperty, sortOrder).map((stemmekrets) => (
                <StemmekretsRow key={getIdFromEntity(stemmekrets)} stemmekrets={stemmekrets} kommuneId={kommuneId} />
              ))}
            </tbody>
          </KretsTable>
        ) : (
          <Spinner />
        )}
      </ModalContent>
    </Modal>
  );
};

export default StemmekretsPanel;
