import { useEffect, useRef, useState } from "react";
const useSearch = () => {
  const [inputValue, setInputValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const timer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log("Searched string", searchValue);
  }, [searchValue]);

  useEffect(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }

    timer.current = setTimeout(() => {
      setSearchValue(inputValue);
      timer.current = null;
    }, 300);
  }, [inputValue]);

  return {
    inputValue,
    setInputValue,
    searchValue,
  };
};

export default useSearch;
