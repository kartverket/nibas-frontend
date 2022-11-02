import { useState } from "react";

const useFeedback = (content: string) => {
  const [isOpen, setIsOpen] = useState(false);

  const openFeedback = () => setIsOpen(true);

  const closeFeedback = () => setIsOpen(false);

  return { isOpen, openFeedback, closeFeedback, feedbackContent: content };
};

export default useFeedback;
