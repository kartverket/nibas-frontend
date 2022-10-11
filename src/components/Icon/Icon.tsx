import { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLSpanElement> & {
  icon: string;
  filled?: boolean;
  className?: string;
};

// finn ikon herifra
// https://kartverket.github.io/kvib/designsystems/designTokens/designsystems/designtokens/ikoner

const Icon = ({ icon, className, filled, ...props }: Props) => {
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

export default Icon;
