import { HTMLAttributes } from "react";
import styled from "styled-components";

type Props = HTMLAttributes<HTMLSpanElement> & {
  icon: string;
  filled?: boolean;
  className?: string;
};

const CustomSVG = styled.svg.attrs({ xmlns: "http://www.w3.org/2000/svg" })`
  width: 32px;
  height: 32px;
  fill: none;
  stroke: currentColor;
`;

const Magnet = ({ className }: { className?: string }) => (
  <CustomSVG viewBox="0 0 24 24" className={className}>
    <path
      d="M9.5 8h-5m16 0h-5m-11-4v8.296c0 4.255 3.582 7.704 8 7.704s8-3.45 8-7.704V4h-5.63v6.818c0 1.205-1.06 2.182-2.37 2.182s-2.37-.977-2.37-2.182V4H4.5z"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CustomSVG>
);

// finn ikon herifra
// https://kartverket.github.io/kvib/designsystems/designTokens/designsystems/designtokens/ikoner

const Icon = ({ icon, className, filled, ...props }: Props) => {
  if (icon === "magnet") {
    return <Magnet className={className} />;
  }

  let fullClassName = "material-symbols-outlined";

  if (filled) {
    fullClassName += "material-symbols-outlined--filled";
  }

  if (className) {
    fullClassName += ` ${className}`;
  }

  return (
    <span className={fullClassName} {...props}>
      {icon}
    </span>
  );
};

export default styled(Icon)``;
