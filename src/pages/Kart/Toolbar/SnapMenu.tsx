import { Menu, MenuList, Switch, Text, CloseButton, MenuDivider, MenuItem, Spacer, useToast, Box } from "@kvib/react";
import { useToolbar } from "contexts/ToolbarContext";
import { styled } from "styled-components";
import { useKeyboardShortcut } from "hooks/keyboard-shortcuts/keyboard-shortcuts-hook";
import MenuButtonWithChevron from "./MenuButtonWithChevron";
import { KeyboardShortcuts } from "hooks/keyboard-shortcuts/keyboard-shortcuts";
import SwitchWithShortcutDesc from "./SwitchWithShortcutDesc";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
};

const SnapMenu = ({ isOpen, onClose, onToggle }: Props) => {
  const { activeModeTools, toggleModeTool } = useToolbar();
  const toast = useToast();

  const toggleSnapping = () => {
    const isMatrikkelToggled = activeModeTools.includes("snap_matrikkel");
    const isNibasToggled = activeModeTools.includes("snap_nibas");

    if (isMatrikkelToggled === isNibasToggled) {
      toggleModeTool("snap_matrikkel");
      toggleModeTool("snap_nibas");
    } else if (isMatrikkelToggled) {
      toggleModeTool("snap_matrikkel");
    } else {
      toggleModeTool("snap_nibas");
    }
  };

  useKeyboardShortcut("snap", () => {
    toggleSnapping();
  });
  useKeyboardShortcut("snap_matrikkel", () => {
    toggleModeTool("snap_matrikkel");
    const isMatrikkelToggled = activeModeTools.includes("snap_matrikkel");
    if (isMatrikkelToggled) {
      toast({ status: "warning", title: "Snapping mot teiggrenser er slått av." });
    } else {
      toast({ status: "info", title: "Snapping mot teiggrenser er slått på." });
    }
  });
  useKeyboardShortcut("snap_nibas", () => {
    toggleModeTool("snap_nibas");
    const isMatrikkelToggled = activeModeTools.includes("snap_nibas");
    if (isMatrikkelToggled) {
      toast({ status: "warning", title: "Snapping mot egne grenser er slått av." });
    } else {
      toast({ status: "info", title: "Snapping mot egne grenser er slått på." });
    }
  });
  useKeyboardShortcut("snap_forced", () => {
    toggleModeTool("snap_forced");
    const isForcedToggled = activeModeTools.includes("snap_forced");
    if (isForcedToggled) {
      toast({ status: "warning", title: "Tvungen snapping er slått av." });
    } else {
      toast({ status: "info", title: "Tvungen snapping er slått på." });
    }
  });
  return (
    <Menu closeOnSelect={false} closeOnBlur={false} onClose={onClose} isOpen={isOpen}>
      <MenuButtonWithChevron
        aria-label="Snap til andre grenser i kartet"
        isOpen={isOpen}
        onClick={onToggle}
        icon="close_fullscreen"
        isActive={activeModeTools.includes("snap_nibas") || activeModeTools.includes("snap_matrikkel")}
        tooltip={{ text: "Snapping" }}
      >
        Snap
      </MenuButtonWithChevron>
      <MenuList minWidth="240px" marginBottom="10px">
        <SnapMenuHeader>
          <Switch
            aria-label="Slå av/på snapping"
            isChecked={activeModeTools.includes("snap_matrikkel") || activeModeTools.includes("snap_nibas")}
            onChange={() => toggleSnapping()}
          />
          <span>Snapping</span>
          <Text fontSize="sm" sx={{ color: "gray.600" }}>
            {KeyboardShortcuts["snap"].displayString}
          </Text>
          <Spacer />
          <CloseButton onClick={onClose} />
        </SnapMenuHeader>
        <MenuDivider />
        <StyledMenuItem>
          <Box w={"100%"}>
            <SwitchWithShortcutDesc
              value="egne"
              onChange={() => toggleModeTool("snap_nibas")}
              isChecked={activeModeTools.includes("snap_nibas")}
              shortcut={KeyboardShortcuts["snap_nibas"].displayString}
            >
              Snap til egne grenser
            </SwitchWithShortcutDesc>
          </Box>
        </StyledMenuItem>
        <StyledMenuItem>
          <Box w={"100%"}>
            <SwitchWithShortcutDesc
              value="matrikkel"
              onChange={() => toggleModeTool("snap_matrikkel")}
              isChecked={activeModeTools.includes("snap_matrikkel")}
              shortcut={KeyboardShortcuts["snap_matrikkel"].displayString}
            >
              Snap til eiendomsgrenser
            </SwitchWithShortcutDesc>
          </Box>
        </StyledMenuItem>
        <StyledMenuItem>
          <Box w={"100%"}>
            <SwitchWithShortcutDesc
              value="forced"
              onChange={() => toggleModeTool("snap_forced")}
              isChecked={activeModeTools.includes("snap_forced")}
              shortcut={KeyboardShortcuts["snap_forced"].displayString}
            >
              Tvungen snapping
            </SwitchWithShortcutDesc>
          </Box>
        </StyledMenuItem>
      </MenuList>
    </Menu>
  );
};

const SnapMenuHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
`;
const StyledMenuItem = styled(MenuItem)`
  padding: 12px;
`;
export default SnapMenu;
