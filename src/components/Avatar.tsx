import { initials } from "@/lib/utils";

export default function Avatar({
  name,
  color = "#4f46e5",
  size = 32,
}: {
  name: string;
  color?: string;
  size?: number;
}) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{ backgroundColor: color, width: size, height: size, fontSize: size * 0.4 }}
      title={name}
    >
      {initials(name) || "?"}
    </div>
  );
}
