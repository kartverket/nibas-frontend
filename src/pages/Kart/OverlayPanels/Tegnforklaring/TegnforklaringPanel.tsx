import React from "react";
import { PanelHeader, PanelProps, SidePanel } from "../Panel";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { Tegnforklaring } from "./Tegnforklaring";
import { tegnforklaringer } from "./tegnforklaring-styles";
import { Divider } from "@kvib/react";

export const TegnforklaringPanel = ({ isOpen }: PanelProps) => {
  const { closeOverlayPanel } = useOverlayPanel();
  return (
    <SidePanel $isOpen={isOpen}>
      <PanelHeader onClose={closeOverlayPanel}>Tegnforklaring</PanelHeader>
      {tegnforklaringer.map((group, index) => (
        <React.Fragment key={`group-${index}`}>
          {group.map((props) => (
            <Tegnforklaring key={props.text} {...props} />
          ))}
          {index < tegnforklaringer.length - 1 && <Divider mb="10px" />}
        </React.Fragment>
      ))}
    </SidePanel>
  );
};
