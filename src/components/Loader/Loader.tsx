import styled from "styled-components";

type Color = "blue" | "green" | "white";

type Props = {
  color?: Color;
  "aria-label"?: string;
};

const getKvibClassName = (color: Color) => {
  const baseClassName = "loader loader--size";
  switch (color) {
    case "white": {
      return `${baseClassName} white--loader loader--white`;
    }

    case "blue": {
      return `${baseClassName} loader--blue`;
    }

    case "green": {
      return `${baseClassName} loader--green`;
    }
  }
};

const Loader = ({ color = "blue", ...props }: Props) => {
  const className = getKvibClassName(color);

  return (
    <LoaderWrapper
      role="alert"
      aria-live="polite"
      aria-label={props["aria-label"]}
      className={className}
    />
  );
};

const LoaderWrapper = styled.div`
  display: inline-block;
  width: 50px;
  height: 50px;
`;

export default Loader;
