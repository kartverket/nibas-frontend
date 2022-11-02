import styled from "styled-components";

type Color = "blue" | "green" | "white";

type Props = {
  color?: Color;
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

const Loader = ({ color = "blue" }: Props) => {
  const className = getKvibClassName(color);

  return <LoaderWrapper className={className} />;
};

const LoaderWrapper = styled.div`
  display: inline-block;
  width: 50px;
  height: 50px;
`;

export default Loader;
