import { useEffect, useRef, useState } from "react";

// TODO: se om denne skal fjernes eller brukes i grunnkretspanel
const useSearch = () => {
  const [inputValue, setInputValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const timer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }

    timer.current = setTimeout(() => {
      setSearchValue(inputValue);
      timer.current = null;
    }, 300);

    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
    };
  }, [inputValue]);

  return {
    inputValue,
    setInputValue,
    searchValue,
  };
};

export default useSearch;
