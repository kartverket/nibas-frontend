import React from "react";
import { AbsolutePanel, PanelHeader, PanelProps } from "../Panel";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { Tegnforklaring } from "./Tegnforklaring";
import { styled } from "styled-components";
import { tegnforklaringer } from "./tegnforklaring-styles";
import { Divider } from "@kvib/react";

export const TegnforklaringPanel = ({ isOpen, className }: PanelProps) => {
    const { closeOverlayPanel } = useOverlayPanel();
    return (
        <TegnforklaringPanelWrapper $isOpen={isOpen} className={className}>
            <PanelHeader size="sm" onClose={closeOverlayPanel}>
                Tegnforklaring
            </PanelHeader>

            {tegnforklaringer.map((group, index) => (
                <React.Fragment key={`group-${index}`}>
                    {group.map((props) => (
                        <Tegnforklaring key={props.text} {...props} />
                    ))}
                    {index < tegnforklaringer.length - 1 && <Divider mb="10px" />}
                </React.Fragment>
            ))}
        </TegnforklaringPanelWrapper>
    );
};

const TegnforklaringPanelWrapper = styled(AbsolutePanel)`
    right: 50px;
    min-width: 400px;
    padding-bottom: 10px;
`;
