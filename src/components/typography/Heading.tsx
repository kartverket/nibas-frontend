import React from "react";

type Tag = "h1" | "h2" | "h3";

type Size = "xs" | "s" | "m" | "l";

type Props = {
  tag: Tag;
  size: Size;
  className?: string; // styled-components className
};

const getKvibClassName = (tag: Tag, size: Size) => {
  let className = "heading__";

  switch (tag) {
    case "h1": {
      className += "h1";
      break;
    }
    case "h2": {
      className += "h2";
      break;
    }
    case "h3": {
      className += "h3";
      break;
    }
  }

  className += "--";

  switch (size) {
    case "xs": {
      className += "xs";
      break;
    }
    case "s": {
      className += "s";
      break;
    }
    case "m": {
      className += "m";
      break;
    }
    case "l": {
      className += "l";
      break;
    }
  }

  return className;
};

const Heading: React.FC<Props> = ({ tag, size, className, children }) => {
  const kvibClassName = getKvibClassName(tag, size);

  const fullClassName = `${kvibClassName} ${className ?? ""}`;

  if (tag === "h1") {
    return <h1 className={fullClassName}>{children}</h1>;
  }
  if (tag === "h2") {
    return <h2 className={fullClassName}>{children}</h2>;
  }
  if (tag === "h3") {
    return <h3 className={fullClassName}>{children}</h3>;
  }

  return null;
};

export default Heading;
