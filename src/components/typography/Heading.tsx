import { HTMLAttributes } from "react";
import styled from "styled-components";

type Tag = "h1" | "h2" | "h3";

type Size = "xs" | "s" | "m" | "l";

type Props = HTMLAttributes<HTMLHeadingElement> & {
  tag: Tag;
  size: Size;
  className?: string; // styled-components className
};

const getKvibClassName = (tag: Tag, size: Size) => `heading__${tag}--${size}`;

const Heading = ({ tag, size, className, children, ...props }: Props) => {
  const kvibClassName = getKvibClassName(tag, size);

  const fullClassName = `${kvibClassName} ${className ?? ""}`;

  if (tag === "h1") {
    return (
      <h1 className={fullClassName} {...props}>
        {children}
      </h1>
    );
  }
  if (tag === "h2") {
    return (
      <h2 className={fullClassName} {...props}>
        {children}
      </h2>
    );
  }
  if (tag === "h3") {
    return (
      <h3 className={fullClassName} {...props}>
        {children}
      </h3>
    );
  }

  return null;
};

export default styled(Heading)``;
