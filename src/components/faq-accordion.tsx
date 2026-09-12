import { Plus } from "lucide-react";

export interface FaqItem {
  question: string;
  answer: string;
}

/** Tanya jawab yang dibuka satu per satu. Dipakai bagian FAQ di halaman aplikasi. */
export function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <div className="border-border border-t">
      {items.map((item) => (
        <details key={item.question} className="accordion group border-border border-b">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-4 text-left [&::-webkit-details-marker]:hidden">
            <span className="display-sm text-[0.9375rem]">{item.question}</span>
            <Plus
              className="text-faint h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-45"
              aria-hidden
            />
          </summary>
          <p className="text-muted-foreground max-w-2xl pr-10 pb-5 leading-relaxed text-pretty">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
