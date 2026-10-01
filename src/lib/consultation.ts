import { consultation, destinations } from "@/data/content";

export interface ConsultationRequest {
  name: string;
  phone: string;
  email: string;
  level: string;
  destination: string;
  course: string;
  mode: string;
}

export type FieldErrors = Partial<Record<keyof ConsultationRequest, string>>;

export const NOT_SURE = "Not sure yet";
export const destinationOptions = [NOT_SURE, ...destinations.map((d) => d.name), "Other"];
export const courseOptions = [NOT_SURE, ...consultation.courseOptions];
export const levelOptions = consultation.educationLevels;
export const modeOptions = consultation.modes.map((m) => m.id);

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Shared by the form (instant feedback) and the API route (authoritative). */
export function validateConsultation(input: Partial<Record<keyof ConsultationRequest, unknown>>): {
  value: ConsultationRequest;
  errors: FieldErrors;
} {
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const value: ConsultationRequest = {
    name: str(input.name).slice(0, 120),
    phone: str(input.phone).slice(0, 24),
    email: str(input.email).slice(0, 160),
    level: str(input.level),
    destination: str(input.destination) || NOT_SURE,
    course: str(input.course) || NOT_SURE,
    mode: str(input.mode) || modeOptions[0],
  };
  const errors: FieldErrors = {};
  if (value.name.length < 2) errors.name = "Please tell us your name.";
  const digits = value.phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 13) errors.phone = "Please enter a phone number we can reach you on.";
  if (!EMAIL.test(value.email)) errors.email = "Please enter a valid email address.";
  if (!levelOptions.includes(value.level)) errors.level = "Please choose your current education level.";
  if (!destinationOptions.includes(value.destination)) errors.destination = "Please choose a destination.";
  if (!courseOptions.includes(value.course)) errors.course = "Please choose a course.";
  if (!modeOptions.includes(value.mode)) errors.mode = "Please choose how you would like to meet.";
  return { value, errors };
}
