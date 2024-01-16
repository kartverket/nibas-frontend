import {
  Button,
  Divider,
  Modal,
  ModalContent,
  ModalOverlay,
} from "@kvib/react";
import { Panel, PanelHeader, PanelProps } from "../Panel";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { styled } from "styled-components";

const InndelingerPanel = ({ isOpen, className }: PanelProps) => {
  const { closeOverlayModal } = useOverlayPanel();

  return (
    <Modal isOpen={isOpen} onClose={closeOverlayModal} scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent as={Panel} $isOpen={isOpen} className={className}>
        <PanelHeader onClose={closeOverlayModal}>
          Velg en inndeling du ønsker å redigere
        </PanelHeader>
        <InndelingerLayout>
          <InndelingerList>
            <Inndeling>Fylker</Inndeling>
            <Inndeling>Kommuner</Inndeling>
            <Inndeling>Stemmekretser</Inndeling>
            <Inndeling>Grunnkretser</Inndeling>
          </InndelingerList>
          <Divider orientation="vertical" />
          <InndelingerList>
            <Inndeling>42 Agder</Inndeling>
            <Inndeling>32 Akershus</Inndeling>
            <Inndeling>33 Buskerud</Inndeling>
            <Inndeling>56 Finnmark</Inndeling>
            <Inndeling>34 Innlandet</Inndeling>
            <Inndeling>15 Møre og Romsdal</Inndeling>
            <Inndeling>18 Nordland</Inndeling>
            <Inndeling>03 Oslo</Inndeling>
            <Inndeling>11 Rogaland</Inndeling>
            <Inndeling>40 Telemark</Inndeling>
            <Inndeling>55 Troms</Inndeling>
            <Inndeling>50 Trøndelag</Inndeling>
            <Inndeling>39 Vestfold</Inndeling>
            <Inndeling>46 Vestland</Inndeling>
            <Inndeling>31 Østfold</Inndeling>
          </InndelingerList>
          <Divider orientation="vertical" />
          <InndelingerList>
            <Inndeling>4203 Arendal</Inndeling>
            <Inndeling>4216 Birkenes</Inndeling>
            <Inndeling>4220 Bygland</Inndeling>
            <Inndeling>4222 Bykle</Inndeling>
            <Inndeling>4206 Farsund</Inndeling>
            <Inndeling>4207 Flekkefjord</Inndeling>
            <Inndeling>4214 Froland</Inndeling>
            <Inndeling>4211 Gjerstad</Inndeling>
            <Inndeling>4202 Grimstad</Inndeling>
            <Inndeling>4218 Iveland</Inndeling>
            <Inndeling>4204 Kristiansand</Inndeling>
            <Inndeling>4227 Kvinesdal</Inndeling>
            <Inndeling>4215 Lillesand</Inndeling>
            <Inndeling>4205 Lindesnes</Inndeling>
            <Inndeling>4225 Lyngdal</Inndeling>
            <Inndeling>4228 Sirdal</Inndeling>
            <Inndeling>4213 Tvedestrand</Inndeling>
            <Inndeling>4221 Valle</Inndeling>
            <Inndeling>4223 Vennesla</Inndeling>
          </InndelingerList>
        </InndelingerLayout>
      </ModalContent>
    </Modal>
  );
};

const InndelingerLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr;
  gap: 16px;
  padding: 8px 0 24px;
  overflow: hidden;
`;

const InndelingerList = styled.section`
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
`;

const Inndeling = styled(Button).attrs({
  variant: "ghost",
  rightIcon: "chevron_right",
})`
  height: unset;
  padding: 24px 16px;
  color: var(--kvib-colors-black);
  font-weight: var(--kvib-fontWeights-normal);

  & > div {
    width: 100%;
    justify-content: space-between;
  }
`;

export default InndelingerPanel;
