import GrensePanel from "./GrensePanel";
import GrunnkretserPanel from "./GrunnkretserPanel";
import StemmekretserPanel from "./StemmekretserPanel";
import { InndelingerKretsProvider } from "contexts/InndelingerKretsContext";
import { useOverlayPanels } from "contexts/OverlayPanelsContext";

const OverlayPanels = () => {
  const { panelContext, kretserContext } = useOverlayPanels();

  return (
    <div>
      {panelContext?.type === "grensemetadata" && (
        <GrensePanel feature={panelContext.feature} />
      )}
      {kretserContext?.type === "grunnkrets" && (
        <InndelingerKretsProvider kretstype="grunnkrets">
          <GrunnkretserPanel kommune={kretserContext.kommune} />
        </InndelingerKretsProvider>
      )}
      {kretserContext?.type === "stemmekrets" && (
        <InndelingerKretsProvider kretstype="stemmekrets">
          <StemmekretserPanel kommune={kretserContext.kommune} />
        </InndelingerKretsProvider>
      )}
    </div>
  );
};

export default OverlayPanels;
