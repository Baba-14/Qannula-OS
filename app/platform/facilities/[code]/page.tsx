import { notFound } from "next/navigation";
import { PlatformFacilityDetail } from "../../../platform-facility-detail";
import { LabNettApplication } from "../../../labnett-application";
import { facilityByCode, facilityPerformance } from "../../../../lib/platform-analytics";

export function generateStaticParams() {
  return facilityPerformance.map(facility => ({ code: facility.code.toLowerCase() }));
}

export default async function PlatformFacilityPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const facility = facilityByCode(code);
  if (!facility) notFound();
  return <LabNettApplication initialRole="main_admin" initialView="facilities" initialContent={<PlatformFacilityDetail facility={facility} />} />;
}
