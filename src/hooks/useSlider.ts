import { useState } from "react";

const useSlider = (initialValue = 100) => {
  const [value, setValue] = useState(initialValue);

  const onChange = (newValue: number) => setValue(newValue);

  return {
    value,
    onChange,
  };
};

export default useSlider;
