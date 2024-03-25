import { styled } from "styled-components";
import { Button, MaterialSymbol } from "@kvib/react";
import { Kretstype } from "contexts/InndelingerContext/InndelingerContext";
import { useEffect, useState } from "react";
import useInndelingFeatures from "contexts/InndelingerContext/useInndelingFeatures";
import { addFeaturesToSource } from "utils/map/source";
import { zoomToFeatures } from "utils/map/map-utils";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { editSource } from "hooks/layers/constants";

type Props = {
  kretstype: Kretstype | null;
  isActive: boolean;
  onClick: () => void;
  rightIcon: MaterialSymbol;
  children: React.ReactNode;
  inndelingid?: string;
};

const Inndeling = (props: Props) => {
  const [shouldFetch, setShouldFetch] = useState(false);
  const { activeOverlayModal, closeOverlayModal } = useOverlayPanel();

  const { features, isLoading } = useInndelingFeatures(props.kretstype, shouldFetch ? props.inndelingid ?? null : null);

  useEffect(() => {
    if (features) {
      addFeaturesToSource("edit", features, () => {
        closeOverlayModal();
        zoomToFeatures(features);
      });
    }
  }, [closeOverlayModal, features]);

  return (
    <InndelingButton
      variant="ghost"
      rightIcon={props.rightIcon}
      isLoading={isLoading}
      onClick={() => {
        props.onClick();
        if (props.inndelingid != null) {
          setShouldFetch(true);
        }
      }}
    >
      {props.children}
    </InndelingButton>
  );
};

export default Inndeling;

const InndelingButton = styled(Button)`
  height: unset;
  padding: 24px 16px;
  color: var(--kvib-colors-black);
  font-weight: var(--kvib-fontWeights-normal);
  & > div {
    width: 100%;
    justify-content: space-between;
  }
  &[data-active] {
    background: var(--kvib-colors-blue-50);
  }
`;
