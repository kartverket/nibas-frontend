import styled from "styled-components";

type Color = "blue" | "green" | "white";

type Props = {
  color?: Color;
  className?: string;
  "aria-label"?: string;
};

const getKvibClassName = (color: Color) =>
  `kv-loader loader--size kv-loader--${color}`;

const Loader = ({ color = "blue", className = "", ...props }: Props) => {
  const kvibClassName = `${getKvibClassName(color)} ${className}`;

  return (
    <LoaderWrapper
      role="alert"
      aria-live="polite"
      aria-label={props["aria-label"]}
      className={kvibClassName}
    />
  );
};

const LoaderWrapper = styled.div`
  display: inline-block;
  width: 50px;
  height: 50px;
`;

export const SmallLoader = styled(Loader)`
  height: 40px;
  width: 40px;
`;

export default Loader;
