import styled from "styled-components";

type Color = "blue" | "green" | "white";

type Props = {
  color?: Color;
  "aria-label"?: string;
};

const getKvibClassName = (color: Color) =>
  `kv-loader loader--size kv-loader--${color}`;

const Loader = ({ color = "blue", ...props }: Props) => {
  const kvibClassName = getKvibClassName(color);

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

export default Loader;
