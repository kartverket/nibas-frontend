import { Button } from "@kvib/react";
import styled from "styled-components";

// TODO: bytt dette ut med noe fra KVIB
export const LinkButton = styled(Button)`
  && {
    height: unset;
    color: inherit;
    background: none;
    border: none;
    padding: 0;

    font: inherit;
    cursor: pointer;
    text-align: left;
    color: var(--blue);
    text-decoration: underline;
    text-underline-offset: 4px;

    :hover {
      background: none;
    }

    :disabled {
      cursor: not-allowed;
      outline: 0;
      background: none;
      color: var(--gray_dark);
      outline-style: solid;
      outline-color: var(--gray_dark);
      opacity: 1;
    }

    :disabled:hover {
      background: none;
      color: var(--gray_dark);
    }
  }
`;
