/**
 * Single source of truth for all copy and business data.
 * Anything not supplied by NIMBUSWORLD is an explicit placeholder — never
 * replace a placeholder with an assumed fact (see brief §35).
 */

export const PLACEHOLDER = "Details coming soon";

export const companyInfo = {
  legalName: "NIMBUSWORLD Education Consultancy Private Limited",
  shortName: "NIMBUSWORLD",
  city: "Pune",
  state: "Maharashtra",
  country: "India",
  tagline: "Your Next Chapter",
  narrative: ["Discover", "Decide", "Depart"] as const,
  positioning: "A–Z support and management for students planning to study abroad.",
  logo: { src: "/logo.png", alt: "NIMBUSWORLD Education Consultancy Private Limited" },
} as const;

export const contact = {
  // Replace the bracketed values when confirmed by NIMBUSWORLD.
  officeAddress: "[Office address], Pune, Maharashtra",
  phone: "[Phone number]",
  email: "[Email address]",
  social: [] as { label: string; href: string }[],
} as const;

export type ChapterId =
  | "prologue"
  | "discover"
  | "destinations"
  | "courses"
  | "languages"
  | "visa"
  | "professional"
  | "journey"
  | "finale";

export interface Chapter {
  id: ChapterId;
  number: string;
  title: string;
  subtitle: string;
  /** Built and reachable in the current release. */
  available: boolean;
}

export const chapters: Chapter[] = [
  { id: "prologue", number: "00", title: "Prologue", subtitle: "Pune to the world", available: true },
  { id: "discover", number: "01", title: "Discover", subtitle: "Discover your world", available: false },
  { id: "destinations", number: "02", title: "Destinations", subtitle: "The world, from the page", available: true },
  { id: "courses", number: "03", title: "Courses", subtitle: "Choose your path", available: true },
  { id: "languages", number: "04", title: "Languages", subtitle: "Speak the world", available: true },
  { id: "visa", number: "05", title: "Visa", subtitle: "From possibility to permission", available: true },
  { id: "professional", number: "06", title: "Professional Education", subtitle: "IATA · Non-IATA · Visa courses", available: true },
  { id: "journey", number: "07", title: "The Journey", subtitle: "Ten steps, one departure", available: true },
  { id: "finale", number: "08", title: "Your Next Chapter", subtitle: "Let’s write it together", available: true },
];

export const hero = {
  kicker: "Discover · Decide · Depart",
  titleLine1: "Your Next",
  titleLine2: "Chapter",
  supporting: "A world of possibilities, waiting to be written.",
  primaryCta: "Begin your journey",
  secondaryCta: "Book a consultation",
  scrollCue: "Scroll to explore",
};

export const prologue = {
  kicker: "Prologue",
  line: "Every journey begins somewhere.",
  body: "Here, it begins in Pune — at a desk, with a question about the rest of the world.",
  stages: [
    { id: "pune", label: "Pune", detail: "18.52° N · 73.86° E" },
    { id: "maharashtra", label: "Maharashtra", detail: "" },
    { id: "india", label: "India", detail: "" },
    { id: "world", label: "World", detail: "" },
  ],
};

/** Geographic coordinates of Pune — used to anchor every map and route. */
export const origin = { name: "Pune", lat: 18.52, lon: 73.86 };

export interface Destination {
  id: string;
  name: string;
  /** Representative map point (capital city) — geography only, no claims. */
  lat: number;
  lon: number;
  /** Where the map label sits relative to its marker. */
  label?: "right" | "left" | "right-up" | "left-up" | "right-down";
  path: string[];
  summary: string;
}

const DIVE_PATH = ["Country", "City", "Campus", "Student life", "Career"];
const divePath = () => [...DIVE_PATH];

export const destinations: Destination[] = [
  { id: "uk", name: "United Kingdom", lat: 51.51, lon: -0.13, label: "right-up", path: divePath(), summary: PLACEHOLDER },
  { id: "ireland", name: "Ireland", lat: 53.35, lon: -6.26, label: "left-up", path: divePath(), summary: PLACEHOLDER },
  { id: "germany", name: "Germany", lat: 52.52, lon: 13.4, label: "right-down", path: divePath(), summary: PLACEHOLDER },
  { id: "canada", name: "Canada", lat: 45.42, lon: -75.7, path: divePath(), summary: PLACEHOLDER },
  { id: "usa", name: "United States", lat: 38.9, lon: -77.04, label: "left", path: divePath(), summary: PLACEHOLDER },
  { id: "australia", name: "Australia", lat: -35.28, lon: 149.13, path: divePath(), summary: PLACEHOLDER },
  { id: "japan", name: "Japan", lat: 35.68, lon: 139.69, path: divePath(), summary: PLACEHOLDER },
];

export const destinationsCopy = {
  kicker: "Chapter 02 — Destinations",
  title: "The world,",
  titleItalic: "from the page.",
  hint: "Select a marker to descend into it",
  collectionsNote: "More destinations in our Top 25 and Top 51 collections — details coming soon",
  selectedLabel: "Selected",
  back: "Back to the map",
  advisorCta: "Talk to an advisor",
};

/** `formCourse` maps a course onto the consultation form's course options. */
export const courses = [
  { id: "study-abroad", numeral: "I", kicker: "Study abroad", title: "Study Abroad", description: "Guidance from the first conversation to the day you leave.", details: PLACEHOLDER, formCourse: "Study abroad" },
  { id: "iata", numeral: "II", kicker: "Professional", title: "IATA", description: "A professional pathway into aviation and travel.", details: PLACEHOLDER, formCourse: "IATA" },
  { id: "non-iata", numeral: "III", kicker: "Professional", title: "Non-IATA", description: "A travel and tourism pathway.", details: PLACEHOLDER, formCourse: "Non-IATA" },
  { id: "visa-courses", numeral: "IV", kicker: "Professional", title: "Visa Courses", description: "Documentation and application processes, understood properly.", details: PLACEHOLDER, formCourse: "Visa course" },
  { id: "language-courses", numeral: "V", kicker: "Languages", title: "Language Courses", description: "Japanese, German and Chinese.", details: PLACEHOLDER, formCourse: undefined as string | undefined },
];

export const coursesCopy = {
  kicker: "Chapter 03 — Courses",
  title: "Choose",
  titleItalic: "your path.",
  intro: "Each page is a different future. Lift one to open it — curriculum, learning environment, and where it can lead.",
  stages: ["Course page", "Curriculum", "Learning environment", "Career environment"],
  pageList: ["Curriculum — details coming soon", "Learning environment", "Career environment"],
  explore: "Explore program",
  advisor: "Explore courses with an advisor",
};

export const languages = [
  { id: "japanese", name: "Japanese", native: "日本語", details: PLACEHOLDER, formCourse: "Japanese" },
  { id: "german", name: "German", native: "Deutsch", details: PLACEHOLDER, formCourse: "German" },
  { id: "chinese", name: "Chinese", native: "中文", details: PLACEHOLDER, formCourse: "Chinese" },
];

export const languagesCopy = {
  kicker: "Chapter 04 — Languages",
  title: "Speak",
  titleItalic: "the world.",
  body: "Classes in Japanese, German and Chinese. Batch timings and levels — details coming soon.",
  cta: "Learn more",
};

export const visaStages = [
  { id: "documents", number: "01", title: "Documents" },
  { id: "checklist", number: "02", title: "Checklist" },
  { id: "application", number: "03", title: "Application stages" },
  { id: "appointment", number: "04", title: "Appointment" },
  { id: "process", number: "05", title: "Visa process" },
  { id: "pre-departure", number: "06", title: "Pre-departure" },
];

export const visaCopy = {
  kicker: "Chapter 05 — Visa",
  title: "From possibility",
  titleItalic: "to permission.",
  body: "Guidance through the journey — documents, applications, appointments and preparation, one page at a time.",
  cta: "Talk to an advisor",
  stamp: { top: "Guided", middle: "every step", bottom: "Pune" },
  now: "Now",
};

export const visaDisclaimer =
  "NIMBUSWORLD provides guidance and support. Visa decisions are made solely by the relevant authorities.";

export const professionalCourses = [
  { id: "iata", pathway: "Pathway I", title: "IATA courses", description: "For careers in aviation and travel.", details: PLACEHOLDER },
  { id: "non-iata", pathway: "Pathway II", title: "Non-IATA courses", description: "For careers in travel and tourism.", details: PLACEHOLDER },
  { id: "visa", pathway: "Pathway III", title: "Visa courses", description: "For work in documentation and applications.", details: PLACEHOLDER },
];

/** VFS Global tie-up — names intentionally unset until supplied. */
export const vfsPrograms = {
  relationship: "tie-up",
  disclaimer:
    "NIMBUSWORLD Education Consultancy Pvt. Ltd. is an independent company. VFS Global is a separate organisation.",
  locations: ["Pune", "Mumbai"],
  programs: [
    { id: "program-01", label: "Program 01", name: null as string | null, details: PLACEHOLDER },
    { id: "program-02", label: "Program 02", name: null as string | null, details: PLACEHOLDER },
    { id: "program-03", label: "Program 03", name: null as string | null, details: PLACEHOLDER },
  ],
};

export const professionalCopy = {
  kicker: "Chapter 06 — Professional education",
  title: "Pathways",
  titleItalic: "into industry.",
  body: "Professional courses for students who want a skill, a credential and a career in travel and international services.",
  explore: "Explore program",
  vfs: {
    kicker: "In association with VFS Global",
    title: "A trusted",
    titleItalic: "educational connection.",
    body: "Through our tie-up with VFS Global, three programs are available to students in Pune and Mumbai.",
    explore: "Explore",
  },
};

export const journey = {
  kicker: "Chapter 07 — The Journey",
  steps: [
    { number: "01", title: "Discover", line: "Where could you go? Every possibility, on the table." },
    { number: "02", title: "Counselling", line: "A conversation about you — your goals, your options." },
    { number: "03", title: "Choose", line: "One destination. One course. One path." },
    { number: "04", title: "Apply", line: "Applications prepared and sent." },
    { number: "05", title: "Document", line: "Every document gathered and in order." },
    { number: "06", title: "Visa", line: "Guidance through the visa process." },
    { number: "07", title: "Prepare", line: "Packing, planning, pre-departure." },
    { number: "08", title: "Depart", line: "The pages have become a terminal. Next, the aircraft — then the Earth, your destination, your university, your career." },
    { number: "09", title: "Arrive", line: "The world turns. A new city comes into view." },
    { number: "10", title: "Begin", line: "A university. A career. Your next chapter." },
  ],
};

export const finale = {
  kicker: "Chapter 08",
  line1: "Your story isn’t written yet.",
  line2: "Let’s write it together.",
  primaryCta: "Start your journey",
  secondaryCta: "Talk to NIMBUSWORLD",
};

export const consultation = {
  kicker: "Book a consultation",
  title: "The first page",
  titleItalic: "is a conversation.",
  body: "Tell us a little about where you are and where you’re hoping to go. An advisor will get in touch to arrange a time.",
  privacy: "We use these details only to contact you about your consultation.",
  submit: "Book a consultation",
  success: "Thank you. An advisor will be in touch to arrange a time.",
  error: "Something went wrong sending your request. Please try again, or contact us directly.",
  educationLevels: ["Class 12", "Undergraduate", "Graduate", "Postgraduate", "Working professional"],
  courseOptions: ["Study abroad", "IATA", "Non-IATA", "Visa course", "Japanese", "German", "Chinese"],
  modes: [
    { id: "in-person", label: "In person, Pune" },
    { id: "phone", label: "Phone" },
    { id: "video", label: "Video call" },
  ],
};

export const navigation = {
  chapters: "Chapters",
  explore: "Explore",
  contact: "Contact",
  start: "Start your journey",
  indexKicker: "Now reading",
  indexHelp: "Choose a chapter to turn straight to it. Your place is kept.",
  indexTitle: "Contents",
  comingSoon: "In preparation",
};
