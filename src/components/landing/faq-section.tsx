import { PageContainer, Section } from "@/components/ui";

import { FAQItem } from "./faq-item";
import { frequentlyAskedQuestions } from "./landing-content";
import styles from "./landing-content.module.css";
import { LandingSectionHeading } from "./landing-section-heading";

export function FAQSection() {
  return (
    <Section id="tanya-jawab" spacing="landing" surface="canvas">
      <PageContainer
        className={`${styles.sectionContent} ${styles.faqContent}`}
      >
        <LandingSectionHeading
          title="Pertanyaan yang sering diajukan"
          description="Jawaban singkat tentang cara kerja dan cakupan Amanah Cash saat ini."
        />
        <ul className={styles.faqList}>
          {frequentlyAskedQuestions.map((item) => (
            <FAQItem key={item.question} {...item} />
          ))}
        </ul>
      </PageContainer>
    </Section>
  );
}
