export type SupportScope = "configuration_read" | "technical_diagnostics" | "patient_record_read";

export type SupportAccessRequest = {
  facility: string;
  ticket: string;
  reason: string;
  scope: SupportScope;
  durationMinutes: number;
  approver: string;
  acknowledged: boolean;
};

export function validateSupportAccess(request: SupportAccessRequest): string[] {
  const issues: string[] = [];
  if (!request.facility.trim()) issues.push("Select a facility");
  if (request.ticket.trim().length < 5) issues.push("Enter a valid support ticket");
  if (request.reason.trim().length < 20) issues.push("Provide a detailed access reason");
  if (request.durationMinutes <= 0 || request.durationMinutes > 60) issues.push("Support access must be between 1 and 60 minutes");
  if (!request.approver.trim()) issues.push("Facility approval is required");
  if (!request.acknowledged) issues.push("Acknowledge monitoring and audit controls");
  return issues;
}
