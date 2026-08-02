import { SystemStatePage } from "@/components/app/experience-pages";

export default async function Page({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params;
  return <SystemStatePage state={state as "offline"} />;
}
