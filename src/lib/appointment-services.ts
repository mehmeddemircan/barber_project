export const HOME_VISIT_SERVICE = "Evde Kesim";

export const APPOINTMENT_SERVICES = [
  "Klasik Kesim",
  "Saç + Sakal",
  "Sakal Tasarımı",
  HOME_VISIT_SERVICE,
] as const;

export type AppointmentService = (typeof APPOINTMENT_SERVICES)[number];

const appointmentServiceSet: ReadonlySet<string> = new Set(APPOINTMENT_SERVICES);

export function isAppointmentService(value: unknown): value is AppointmentService {
  return typeof value === "string" && appointmentServiceSet.has(value);
}
