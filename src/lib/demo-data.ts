export type Rep = {
  name: string;
  initials: string;
  role: string;
  progress: number;
  score: number;
  status: "On track" | "Needs attention" | "Certified";
  streak: number;
};

export const reps: Rep[] = [
  { name: "Maya Chen", initials: "MC", role: "Enterprise AE", progress: 72, score: 88, status: "On track", streak: 8 },
  { name: "Jordan Lee", initials: "JL", role: "Mid-market AE", progress: 48, score: 74, status: "Needs attention", streak: 3 },
  { name: "Priya Patel", initials: "PP", role: "Enterprise AE", progress: 100, score: 94, status: "Certified", streak: 15 },
  { name: "Noah Williams", initials: "NW", role: "Commercial AE", progress: 61, score: 82, status: "On track", streak: 6 },
];

export const dailyTasks = [
  { type: "Learn", title: "Discovery that earns the next question", detail: "8 min · 3 concepts", done: true },
  { type: "Assess", title: "Product & positioning checkpoint", detail: "10 questions · 12 min", done: false },
  { type: "Practice", title: "Handle the “build vs. buy” objection", detail: "AI roleplay · 15 min", done: false },
];

export const knowledge = [
  { title: "Enterprise messaging guide", type: "PDF", size: "2.4 MB", status: "Ready", updated: "2 hours ago" },
  { title: "Q3 Product roadmap", type: "DOCX", size: "1.8 MB", status: "Ready", updated: "Yesterday" },
  { title: "Customer win stories", type: "URL", size: "12 pages", status: "Ready", updated: "Aug 23" },
  { title: "Security & compliance FAQ", type: "PDF", size: "840 KB", status: "Processing", updated: "Just now" },
];

export const programDays = [
  { day: 1, title: "Company & market", focus: "Foundation", complete: true },
  { day: 2, title: "Ideal customer profile", focus: "Foundation", complete: true },
  { day: 3, title: "Discovery fundamentals", focus: "Skill", complete: true },
  { day: 4, title: "Product narrative", focus: "Knowledge", complete: false },
  { day: 5, title: "Objection handling", focus: "Practice", complete: false },
  { day: 6, title: "Competitive landscape", focus: "Knowledge", complete: false },
  { day: 7, title: "Value articulation", focus: "Skill", complete: false },
  { day: 8, title: "Technical discovery", focus: "Skill", complete: false },
  { day: 9, title: "Executive conversations", focus: "Practice", complete: false },
  { day: 10, title: "Commercial process", focus: "Knowledge", complete: false },
  { day: 11, title: "Negotiation", focus: "Skill", complete: false },
  { day: 12, title: "Roleplay: discovery", focus: "Practice", complete: false },
  { day: 13, title: "Roleplay: objections", focus: "Practice", complete: false },
  { day: 14, title: "Final assessment", focus: "Assessment", complete: false },
  { day: 15, title: "Readiness certification", focus: "Certification", complete: false },
];

export const brainTopics = [
  { name: "Company & mission", coverage: 96, sources: 8 },
  { name: "Products & use cases", coverage: 91, sources: 14 },
  { name: "Ideal customer profile", coverage: 84, sources: 6 },
  { name: "Competitive landscape", coverage: 72, sources: 9 },
  { name: "Sales methodology", coverage: 79, sources: 5 },
];

export const reportSkills = [
  { label: "Discovery", value: 88 },
  { label: "Product knowledge", value: 92 },
  { label: "Objection handling", value: 76 },
  { label: "Value articulation", value: 84 },
  { label: "Competitive positioning", value: 71 },
];
