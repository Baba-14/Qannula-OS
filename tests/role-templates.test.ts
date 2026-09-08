import { describe, expect, it } from "vitest";
import { roleTemplates, validateRoleTemplate } from "../lib/role-templates";

describe("role and dashboard governance", () => {
  it("keeps global role keys unique and every template operational", () => {
    expect(new Set(roleTemplates.map(template => template.id)).size).toBe(roleTemplates.length);
    for (const template of roleTemplates) {
      expect(validateRoleTemplate(template)).toEqual([]);
      expect(template.widgets.length).toBeGreaterThan(0);
      expect(template.permissions.length).toBeGreaterThan(0);
    }
  });

  it("locks the required facility and verification roles", () => {
    const required = roleTemplates.filter(template => template.required);
    expect(required.map(template => template.id)).toEqual(expect.arrayContaining(["facility_admin", "verifier"]));
    expect(required.every(template => template.safetyLocked)).toBe(true);
  });

  it("rejects incomplete or unsafe template drafts", () => {
    expect(validateRoleTemplate({ id: "Bad key", name: "", dashboard: "", widgets: [], permissions: [] })).toEqual([
      "Role key must use lowercase letters, numbers and underscores",
      "Role name is required",
      "Dashboard name is required",
      "Select at least one dashboard widget",
      "Add at least one permission",
    ]);
  });
});
