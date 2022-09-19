import styled from "styled-components";
import { KartInteractable } from "../KartInteractable";
import Button from "components/form/Button";
import { useToolbar } from "contexts/ToolbarContext";
import { useUtkast } from "contexts/UtkastContext";
import CreateUtkastToolbar from "./CreateUtkastToolbar";
import { useState } from "react";

type Props = {
  openCreateUtkast: () => void;
};

const DefaultToolbar = ({ openCreateUtkast }: Props) => {
  const { canSave, save, undo, redo } = useToolbar();
  const { hasChanges } = useUtkast();

  return (
    <div>
      {hasChanges && (
        <Button onClick={save} disabled={!canSave}>
          Lagre
        </Button>
      )}
      {!hasChanges && (
        <Button onClick={openCreateUtkast} disabled={!canSave}>
          Lagre som
        </Button>
      )}
      <Button onClick={undo} disabled={!undo}>
        Undo
      </Button>
      <Button onClick={redo} disabled={!redo}>
        Redo
      </Button>
    </div>
  );
};

export default DefaultToolbar;
