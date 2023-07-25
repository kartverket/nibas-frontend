import { Alert, AlertIcon, AlertTitle } from "@kvib/react";
import { useKartlag } from "contexts/KartlagContext/KartlagContext";
import ActiveKartlag from "./ActiveKartlag";

const ActiveKartlagList = () => {
  const { visibleLayers } = useKartlag();

  return (
    <>
      {visibleLayers.length > 0 ? (
        visibleLayers.map((layer, index) => (
          <ActiveKartlag key={layer.mainLayer} layer={layer} index={index} />
        ))
      ) : (
        <Alert>
          <AlertIcon />
          <AlertTitle>TODO: Det er ingen aktive kartlag</AlertTitle>
        </Alert>
      )}
    </>
  );
};

export default ActiveKartlagList;
