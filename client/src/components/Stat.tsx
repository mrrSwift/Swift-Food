



export default function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white/70 p-4">
      <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        {icon}
      </span>
      <strong className="mt-4 block text-3xl">{value}</strong>
      <span className="text-sm text-slate-500">{label}</span>
    </div>
  );
}