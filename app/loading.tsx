import Image from "next/image";

export default function Loading() {
  return (
    <div role="status" aria-label="Loading" className="fixed inset-0 flex items-center justify-center">
      <Image src="/logo.png" alt="" width={72} height={72} className="animate-pulse rounded-2xl motion-reduce:animate-none" priority />
    </div>
  );
}
