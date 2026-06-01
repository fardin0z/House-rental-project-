import { AppHeader } from "@/components/shared/app-header";

export default function PropertiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <AppHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
