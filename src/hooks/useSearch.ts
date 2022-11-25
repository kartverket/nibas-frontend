import { useEffect, useRef, useState } from "react";
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
      setSearchValue((prevValue) => (prevValue ? inputValue : prevValue));
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
