"use client";

import { ChevronDown } from "lucide-react";
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
          <ChevronDown aria-hidden="true" className={styles.faqIndicator} />
        </button>
      </h3>
      <div
        aria-labelledby={buttonId}
        className={styles.faqAnswer}
        aria-hidden={!isOpen}
        id={answerId}
        role="region"
        data-open={isOpen}
      >
        <div className={styles.faqAnswerInner}>
          <p>{answer}</p>
        </div>
      </div>
    </li>
  );
}
