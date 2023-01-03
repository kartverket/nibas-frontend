import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import GrenseMetadataGenerelt from "./GrenseMetadataGenerelt";
import GrenseMetadataReferanser from "./GrenseMetadataReferanser";
import Tabs from "components/Tabs";
import Heading from "components/typography/Heading";
import { useOverlayPanels } from "contexts/OverlayPanelsContext";
import Icon from "components/Icon";
import {
  AbsoluteHeaderButton,
  OverlayPanelWrapper,
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

  const getTabsOrMinimizedHeading = () => {
    if (panelContext?.isMinimized) {
      return (
        <Heading size="xs" tag="h2">
          Metadata for linje
        </Heading>
      );
    }

    return (
      <Tabs key={feature.getId()} tabTransKeys={tabs}>
        <div>
          <Heading size="xs" tag="h2">
            Metadata for linje
          </Heading>
          <Separator />
          <GrenseMetadataGenerelt feature={feature} />
        </div>
        {showReferanser && (
          <div>
            <Heading size="xs" tag="h2">
              Dokumentasjonsreferanser
            </Heading>
            <Separator />
            <GrenseMetadataReferanser feature={feature} />
          </div>
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

const Separator = styled.div<{ color?: string }>`
  border-top: 2px solid var(--gray_light);
  height: 1px;
  margin-bottom: 24px;
`;
export default GrensePanel;
