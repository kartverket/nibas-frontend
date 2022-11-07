import styled from "styled-components";
import { KartInteractable } from "../KartInteractable";
import GrensePanel from "./GrensePanel";
import GrunnkretserPanel from "./GrunnkretserPanel";
import StemmekretserPanel from "./StemmekretserPanel";
import { InndelingerKretsProvider } from "contexts/InndelingerKretsContext";
import { userOverlayPanels } from "contexts/OverlayPanelsContext";

const OverlayPanels = () => {
  const { panelContext, kretserContext } = userOverlayPanels();

  return (
    <>
      {panelContext?.type === "grensemetadata" && (
        <OverlayPanelWrapper key="grensemetadata" gridArea="metadata">
          <GrensePanel feature={panelContext.feature} />
        </OverlayPanelWrapper>
      )}
      {kretserContext?.type === "grunnkrets" && (
        <OverlayPanelWrapper key="grensemetadata" gridArea="kretser">
          <InndelingerKretsProvider kretstype="grunnkrets">
            <GrunnkretserPanel kommune={kretserContext.kommune} />
          </InndelingerKretsProvider>
        </OverlayPanelWrapper>
      )}
      {kretserContext?.type === "stemmekrets" && (
        <OverlayPanelWrapper key="grensemetadata" gridArea="kretser">
          <InndelingerKretsProvider kretstype="stemmekrets">
            <StemmekretserPanel kommune={kretserContext.kommune} />
          </InndelingerKretsProvider>
        </OverlayPanelWrapper>
      )}
    </>
  );
};

export const OverlayPanelWrapper = styled(KartInteractable)<{
  gridArea: "metadata" | "kretser";
}>`
  position: relative;
  grid-area: ${({ gridArea }) => gridArea};
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin-left: auto;
  padding: 16px;
  border-radius: 3px;
  height: 500px;
  border: 2px solid ${({ theme }) => theme.colors.blue};
  border-bottom: none;
  border-right: none;
  overflow-y: auto;

  /* @media (min-width: ${({ theme }) => theme.dimensions.lgPx}) {
    border-bottom: 2px solid ${({ theme }) => theme.colors.blue};
  } */

  min-width: 500px;
  width: 100%;
  max-width: 1000px;

  > h2 {
    margin-top: 0;
    margin-bottom: 16px;
  }
`;

export default OverlayPanels;
