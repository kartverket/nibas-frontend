import GrunnkretserPanel from "./GrunnkretserPanel";
import StemmekretserPanel from "./StemmekretserPanel";
import { InndelingerKretsProvider } from "contexts/InndelingerKretsContext";
import { useOverlayPanels } from "contexts/OverlayPanelsContext";

const OverlayPanels = () => {
  const { kretserContext } = useOverlayPanels();

  return (
    <div>
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
