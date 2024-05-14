import { useEffect, useRef, useState } from "react";

const useSearch = () => {
  const [inputValue, setInputValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const clearSearch = () => {
    setInputValue("");
    setSearchValue("");
  };

  return {
    inputValue,
    setInputValue,
    searchValue,
    clearSearch,
  };
};

export default useSearch;
