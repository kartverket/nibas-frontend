import { Alert, AlertIcon } from "@kvib/react";
import { styled } from "styled-components";
import { PanelHeader } from "../Panel";
type SosiGrenseInformasjonProps = {
  onClose: () => void;
};

const GrensePanelContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 24px;
`;

export const SosiGrenseInformasjon = ({ onClose }: SosiGrenseInformasjonProps) => {
  return (
    <GrensePanelContent>
      <PanelHeader noMargin onClose={onClose}>
        Informasjon
      </PanelHeader>

      <Alert status="info">
        <AlertIcon />
        Det blir snart mulig å se informasjon om sosi-grenser.
      </Alert>
    </GrensePanelContent>
  );
};
