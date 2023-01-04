import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import GrenseMetadataGenerelt from "./GrenseMetadataGenerelt";
import GrenseMetadataReferanser from "./GrenseMetadataReferanser";
import Tabs from "components/Tabs";
import { useOverlayPanels } from "contexts/OverlayPanelsContext";
import Icon from "components/Icon";
import {
  AbsoluteHeaderButton,
  OverlayPanelWrapper,
  PanelHeader,
  PanelTitle,
} from "../metadataComponents";
import styled from "styled-components";

const showReferanserByGrenseType: Record<string, boolean> = {
  Territorialgrense: true,
  Fylkesgrense: true,
  Kommunegrense: true,
  AvtaltAvgrensningslinje: true,
  Riksgrense: true,
  Grunnlinje: true,
};

type Props = {
  feature: Feature<Geometry>;
};

const GrensePanel = ({ feature }: Props) => {
  let tabs: string[];
  const { closePanel, toggleMinimizePanel, panelContext } = useOverlayPanels();

  const showReferanser =
    showReferanserByGrenseType[feature.getProperties().type as string];

  if (showReferanser) {
    tabs = ["metadata.Generelt", "metadata.Referanser"];
  } else {
    tabs = ["metadata.Generelt"];
  }

  const getPanelHeader = (title: string) => {
    return (
      <PanelHeader borderBottom={false}>
        <PanelTitle tag="h2" size="xs">
          {title}
        </PanelTitle>
      </PanelHeader>
    );
  };

  const getTabsOrMinimizedHeading = () => {
    if (panelContext?.isMinimized) {
      return getPanelHeader("Metadata for linje");
    }

    return (
      <Tabs key={feature.getId()} tabTransKeys={tabs}>
        <MetadataWrapper>
          {getPanelHeader("Metadata for linje")}
          <Separator />
          <GrenseMetadataGenerelt feature={feature} />
        </MetadataWrapper>
        {showReferanser && (
          <MetadataWrapper>
            {getPanelHeader("Dokumentasjonsreferanser")}
            <Separator />
            <GrenseMetadataReferanser feature={feature} />
          </MetadataWrapper>
        )}
      </Tabs>
    );
  };

  return (
    <OverlayPanelWrapper
      key="grensemetadata"
      gridArea="metadata"
      minimized={panelContext?.isMinimized ?? false}
    >
      <AbsoluteHeaderButton
        right={0}
        icon={<Icon icon="close" />}
        onClick={() => closePanel("grensemetadata")}
      />
      <AbsoluteHeaderButton
        right={50}
        onClick={() => toggleMinimizePanel("grensemetadata")}
        icon={
          panelContext?.isMinimized ? (
            <Icon icon="expand_less" />
          ) : (
            <Icon icon="expand_more" />
          )
        }
      />
      {getTabsOrMinimizedHeading()}
    </OverlayPanelWrapper>
  );
};

const Separator = styled.div`
  border-top: 2px solid var(--gray_light);
  height: 1px;
  margin-bottom: 24px;
`;

const MetadataWrapper = styled.div`
  margin-top: 16px;
`;

export default GrensePanel;
