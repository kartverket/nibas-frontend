import { useDisclosure } from "@kvib/react";

const useFlateHighlight = () => {
  const { isOpen: isActive, onToggle: toggle } = useDisclosure();

  return {
    isActive,
    toggle,
  };
};

export default useFlateHighlight;
