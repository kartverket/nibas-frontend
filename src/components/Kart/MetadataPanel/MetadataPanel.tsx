import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { KartInteractable } from "../KartInteractable";
import GrensePanel from "./GrensePanel";
import GrunnkretserPanel from "./GrunnkretserPanel";
import StemmekretserPanel from "./StemmekretserPanel";
import Button from "components/form/Button";
import { useMetadataPanel } from "contexts/MetadataPanelContext";

const MetadataPanel = () => {
  const { t } = useTranslation();
  const { panelContext, closePanel } = useMetadataPanel();

  if (!panelContext) return null;

  return (
    <Panel>
      {panelContext.content === "grensemetadata" && (
        <GrensePanel feature={panelContext.feature} />
      )}
      {panelContext.content === "grunnkrets" && (
        <GrunnkretserPanel kommune={panelContext.kommune} />
      )}
      {panelContext.content === "stemmekrets" && (
        <StemmekretserPanel kommune={panelContext.kommune} />
      )}
      <div>
        <Button onClick={closePanel}>{t("action.Lukk")}</Button>
      </div>
    </Panel>
  );
};

const Panel = styled(KartInteractable)`
  grid-area: metadata;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-left: auto;
  border: 1px solid ${({ theme }) => theme.colors.grayLight};
  padding: 16px;
  overflow: auto;
  border-radius: 3px;
  height: 500px;

  min-width: 500px;
  width: 100%;
  max-width: 1000px;

  @media (min-width: ${({ theme }) => theme.dimensions.lgPx}) {
    height: auto;
    max-height: 800px;
    width: 600px;
  }

  > h2 {
    margin-top: 0;
    margin-bottom: 16px;
  }
`;

export default MetadataPanel;
