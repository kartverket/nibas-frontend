import { Environment, getCurrentEnvironment } from "components/FeatureToggle";
import { styled } from "styled-components";
import { zindex } from "utils/constants";

type EnvironmentStyle = { label: string; color: string };
const styles: Record<Environment, EnvironmentStyle> = {
  dev: {
    label: "Utviklingsmiljø",
    color: "var(--kvib-colors-purple-200)",
  },
  prod: {
    label: "",
    color: "transparent",
  },
};

const EnvironmentOverlay = ({ children }: { children: React.ReactNode }) => {
  const env = getCurrentEnvironment();
  const style = styles[env];

  return (
    <>
      {children}
      <Overlay color={style.color}>
        <OverlayLabel color={style.color}>{style.label}</OverlayLabel>
      </Overlay>
    </>
  );
};

const Overlay = styled.div<{ color: string }>`
  position: fixed;
  border: 4px solid ${(props) => props.color};
  inset: 0;
  pointer-events: none;
  z-index: ${zindex.environmentOverlay};
`;

const OverlayLabel = styled.span<{ color: string }>`
  display: inline-block;
  position: relative;
  top: 50%;
  writing-mode: vertical-lr;

  transform: translateY(-50%);
  font-weight: bold;
  background: ${(props) => props.color};
  padding: 16px 8px 16px 4px;
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
`;

export default EnvironmentOverlay;
