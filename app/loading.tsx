import { Logo } from "@/components/Logo";

export default function Loading() {
  return (
    <div role="status" aria-label="Loading" className="fixed inset-0 flex items-center justify-center">
      <Logo className="h-20 w-20 animate-pulse motion-reduce:animate-none" />
    </div>
  );
}
