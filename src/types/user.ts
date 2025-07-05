interface User {
  id: string;
  email: string;
  name: string;
  preferences?: {
    level: "beginner" | "intermediate" | "advanced";
    topics: string; // select only one topic
  };
}