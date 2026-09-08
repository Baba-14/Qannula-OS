import { notFound } from "next/navigation";
import { LabNettApplication } from "../../labnett-application";
import { stationRoles } from "../../../lib/navigation";
import type { StationId } from "../../../lib/navigation";

export function generateStaticParams() {
  return Object.keys(stationRoles).map(station => ({ station }));
}

export default async function StationWorkspace({ params }: { params: Promise<{ station: string }> }) {
  const { station } = await params;
  if (!(station in stationRoles)) notFound();
  return <LabNettApplication initialRole={stationRoles[station as StationId]} />;
}
