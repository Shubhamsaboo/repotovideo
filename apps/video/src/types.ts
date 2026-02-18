export interface RepoData {
  name: string;
  fullName: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  hookStyle: "counter" | "momentum" | "problem";
  hookText: string;
  tagline: string;
  features: Array<{ emoji: string; title: string; desc: string }>;
  techStack: Array<{ emoji: string; name: string }>;
}
