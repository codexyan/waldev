import { Fragment } from "react";

/**
 * Judul yang muncul baris demi baris dari balik topeng.
 * Seluruhnya dirender di server; animasi murni CSS sehingga terlihat
 * seketika saat halaman dibuka tanpa menunggu JavaScript.
 */
export function LineReveal({
  lines,
  marked,
  baseDelay = 100,
  step = 110,
}: {
  lines: string[];
  /** Kata pada salah satu baris yang diberi sapuan stabilo. */
  marked?: string;
  baseDelay?: number;
  step?: number;
}) {
  return (
    <>
      {lines.map((line, index) => (
        <span key={line} className="line-mask">
          <span
            className="line-inner"
            style={{ animationDelay: `${baseDelay + index * step}ms` }}
          >
            {marked && line.includes(marked) ? <Marked line={line} word={marked} /> : line}
          </span>
        </span>
      ))}
    </>
  );
}

function Marked({ line, word }: { line: string; word: string }) {
  const at = line.indexOf(word);
  return (
    <Fragment>
      {line.slice(0, at)}
      <span className="marker">{word}</span>
      {line.slice(at + word.length)}
    </Fragment>
  );
}
