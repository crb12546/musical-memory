import * as React from "react";
import { FileText, Search, Briefcase, Calendar, UserCheck } from "lucide-react";

export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  subItems?: { id: string; label: string }[];
}

export const navigationItems: NavigationItem[] = [
  {
    id: "recruitment",
    label: "招聘需求",
    icon: <Briefcase className="w-5 h-5 text-gray-500" />,
    subItems: [
      { id: "project-create", label: "创建需求" },
      { id: "project-list", label: "需求列表" },
    ],
  },
  {
    id: "resume-management",
    label: "简历管理",
    icon: <FileText className="w-5 h-5 text-gray-500" />,
    subItems: [
      { id: "resume-upload", label: "简历录入" },
      { id: "resume-view", label: "简历查看" },
    ],
  },
  {
    id: "screening",
    label: "简历筛选",
    icon: <Search className="w-5 h-5 text-gray-500" />,
    subItems: [
      { id: "talent-matching", label: "人才匹配" },
    ],
  },
  {
    id: "interviews",
    label: "面试管理",
    icon: <Calendar className="w-5 h-5 text-gray-500" />,
    subItems: [
      { id: "interview-list", label: "面试列表" },
      { id: "interview-schedule", label: "面试安排" },
      { id: "interview-feedback", label: "面试反馈" },
    ],
  },
  {
    id: "onboarding",
    label: "入职管理",
    icon: <UserCheck className="w-5 h-5 text-gray-500" />,
  },
];
