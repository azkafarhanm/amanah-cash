"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useId, useState } from "react";

import styles from "./landing-content.module.css";

export function FAQItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const id = useId();
  const answerId = `${id}-answer`;
  const buttonId = `${id}-button`;
  const Indicator = isOpen ? ChevronUp : ChevronDown;

  return (
    <li className={styles.faqItem}>
      <h3>
        <button
          aria-controls={answerId}
          aria-expanded={isOpen}
          className={styles.faqButton}
          id={buttonId}
          onClick={() => setIsOpen((open) => !open)}
          type="button"
        >
          {question}
          <Indicator aria-hidden="true" className={styles.faqIndicator} />
        </button>
      </h3>
      <div
        aria-labelledby={buttonId}
        className={styles.faqAnswer}
        hidden={!isOpen}
        id={answerId}
        role="region"
      >
        {answer}
      </div>
    </li>
  );
}
