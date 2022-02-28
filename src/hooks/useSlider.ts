import React, { useState } from "react";

const useSlider = (initialValue = 100) => {
  const [value, setValue] = useState(initialValue);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setValue(parseInt(event.target.value, 10));

  return {
    value,
    onChange,
  };
};

export default useSlider;
