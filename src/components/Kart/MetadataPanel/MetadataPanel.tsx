import styled from "styled-components";
import { KartInteractable } from "../KartInteractable";
import GrensePanel from "./GrensePanel";
import GrunnkretserPanel from "./GrunnkretserPanel";
import StemmekretserPanel from "./StemmekretserPanel";
import { InndelingerKretsProvider } from "contexts/InndelingerKretsContext";
import { useMetadataPanel } from "contexts/MetadataPanelContext";

const MetadataPanel = () => {
  const { panelContext } = useMetadataPanel();

  if (!panelContext) return null;

  return (
    <MetadataPanelWrapper>
      {panelContext.content === "grensemetadata" && (
        <GrensePanel feature={panelContext.feature} />
      )}
      {panelContext.content === "grunnkrets" && (
        <InndelingerKretsProvider kretstype={"grunnkrets"}>
          <GrunnkretserPanel kommune={panelContext.kommune} />
        </InndelingerKretsProvider>
      )}
      {panelContext.content === "stemmekrets" && (
        <InndelingerKretsProvider kretstype={"stemmekrets"}>
          <StemmekretserPanel kommune={panelContext.kommune} />
        </InndelingerKretsProvider>
      )}
    </MetadataPanelWrapper>
  );
};

export const MetadataPanelWrapper = styled(KartInteractable)`
  grid-area: metadata;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-left: auto;
  padding: 16px;
  border-radius: 3px;
  height: 500px;
  border: 2px solid ${({ theme }) => theme.colors.blue};
  border-bottom: none;
  border-right: none;

  @media (min-width: ${({ theme }) => theme.dimensions.lgPx}) {
    border-bottom: 2px solid ${({ theme }) => theme.colors.blue};
  }

  min-width: 500px;
  width: 100%;
  max-width: 1000px;

  > h2 {
    margin-top: 0;
    margin-bottom: 16px;
  }
`;

export default MetadataPanel;
