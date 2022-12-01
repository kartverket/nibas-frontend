import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import GrenseMetadataGenerelt from "./GrenseMetadataGenerelt";
import GrenseMetadataReferanser from "./GrenseMetadataReferanser";
import Tabs from "components/Tabs";
import Heading from "components/typography/Heading";
import { useOverlayPanels } from "contexts/OverlayPanelsContext";
import Icon from "components/Icon";
import { HeaderButton, OverlayPanelWrapper } from "../metadataComponents";

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
    tabs = ["metadata.Generelt", "metadata.Referanser", "metadata.Historikk"];
  } else {
    tabs = ["metadata.Generelt", "metadata.Historikk"];
  }

  const getTabsOrMinimizedHeading = () => {
    if (panelContext?.isMinimized) {
      return (
        <Heading size="xs" tag="h2">
          Linje metadata
        </Heading>
      );
    }

    return (
      <Tabs key={feature.getId()} tabTransKeys={tabs}>
        <div>
          <Heading size="xs" tag="h2">
            Linje metadata
          </Heading>
          <GrenseMetadataGenerelt feature={feature} />
        </div>
        {showReferanser && (
          <div>
            <Heading size="xs" tag="h2">
              Dokumentasjonsreferanser
            </Heading>
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
      <HeaderButton
        right={0}
        icon={<Icon icon="close" />}
        onClick={() => closePanel("grensemetadata")}
      />
      <HeaderButton
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

export default GrensePanel;
