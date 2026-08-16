/**
 * Angka yang menghitung naik saat terlihat. Nilai akhir sudah dirender di
 * server, jadi tanpa JavaScript angkanya tetap benar.
 */
export function CountUp({
  value,
  suffix = "",
  className,
}: {
  value: number;
  suffix?: string;
  className?: string;
}) {
  return (
    <span className={className} data-count={value} data-count-suffix={suffix}>
      {value}
      {suffix}
    </span>
  );
}
