import type { Locale } from "../i18n/types";
import type { SubjectId } from "./types";

export type SubjectRecord = {
  id: SubjectId;
  name: Record<Locale, string>;
  shortName: string;
  description: Record<Locale, string>;
  permission: string;
  enabled: boolean;
};

export const subjects: SubjectRecord[] = [
  {
    id: "math",
    shortName: "Math",
    name: {
      "zh-CN": "数学",
      "en-US": "Math"
    },
    description: {
      "zh-CN": "用可视化和互动实验理解抽象概念。",
      "en-US": "Explore abstract ideas through visual, interactive labs."
    },
    permission: "light.subject.math",
    enabled: true
  },
  {
    id: "english",
    shortName: "English",
    name: {
      "zh-CN": "英语",
      "en-US": "English"
    },
    description: {
      "zh-CN": "从音素、拼读、词句和表达开始构建英语能力。",
      "en-US": "Build English through phonics, words, sentences, and expression."
    },
    permission: "light.subject.english",
    enabled: true
  }
];

export const enabledSubjects = subjects.filter((subject) => subject.enabled);

export const subjectIds = enabledSubjects.map((subject) => subject.id);

export const isSubjectId = (value: string | undefined): value is SubjectId =>
  subjectIds.includes(value as SubjectId);

export const findSubjectById = (id: SubjectId) =>
  enabledSubjects.find((subject) => subject.id === id);
