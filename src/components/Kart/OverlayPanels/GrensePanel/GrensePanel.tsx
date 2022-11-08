import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import GrenseMetadataDetaljer from "./GrenseMetadataDetaljer";
import GrenseMetadataGenerelt from "./GrenseMetadataGenerelt";
import GrenseMetadataReferanser from "./GrenseMetadataReferanser";
import Tabs from "components/Tabs";
import Heading from "components/typography/Heading";
import { useOverlayPanels } from "contexts/OverlayPanelsContext";
import { ClosePanelButton } from "components/Kart/OverlayPanels/ClosePanelButton";
import styled from "styled-components";
import Button from "components/form/Button";
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
    tabs = [
      "metadata.Generelt",
      "metadata.Detaljer",
      "metadata.Referanser",
      "metadata.Historikk",
    ];
  } else {
    tabs = ["metadata.Generelt", "metadata.Detaljer", "metadata.Historikk"];
  }

  return (
    <OverlayPanelWrapper
      key="grensemetadata"
      gridArea="metadata"
      minimized={panelContext?.isMinimized ?? false}
    >
      {/* <ClosePanelButton onClose={() => closePanel("grensemetadata")} /> */}
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
      {panelContext?.isMinimized ? (
        <Heading size="xs" tag="h2">
          Linje metadata
        </Heading>
      ) : (
        <Tabs key={feature.getId()} tabTransKeys={tabs}>
          <div>
            <Heading size="xs" tag="h2">
              Linje metadata
            </Heading>
            <GrenseMetadataGenerelt feature={feature} />
          </div>
          <div>
            <Heading size="xs" tag="h2">
              Detaljer
            </Heading>
            <GrenseMetadataDetaljer feature={feature} />
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
      )}
    </OverlayPanelWrapper>
  );
};

export default GrensePanel;
