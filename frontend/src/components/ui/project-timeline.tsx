import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, Circle } from "lucide-react";
import type { Project } from "@/lib/api";

interface TimelineStageProps {
  stage: {
    id: string;
    label: string;
  };
  isActive: boolean;
  isComplete: boolean;
  isLast?: boolean;
}

function TimelineStage({ stage, isActive, isComplete, isLast }: TimelineStageProps) {
  return (
    <div className="relative flex items-center">
      <div className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full border",
        isComplete ? "border-green-500 bg-green-50" : 
        isActive ? "border-blue-500 bg-blue-50" :
        "border-gray-300 bg-white"
      )}>
        {isComplete ? (
          <CheckCircle className="h-6 w-6 text-green-500" />
        ) : (
          <Circle className={cn(
            "h-6 w-6",
            isActive ? "text-blue-500" : "text-gray-300"
          )} />
        )}
      </div>
      <div className="ml-4 flex min-w-0 flex-1 items-center justify-between">
        <div>
          <p className={cn(
            "text-sm font-medium",
            isComplete ? "text-green-500" :
            isActive ? "text-blue-500" :
            "text-gray-500"
          )}>
            {stage.label}
          </p>
        </div>
      </div>
      {!isLast && (
        <div className={cn(
          "absolute left-4 top-8 -ml-px h-12 w-0.5",
          isComplete ? "bg-green-500" : "bg-gray-300"
        )} />
      )}
    </div>
  );
}

export function ProjectTimeline({ project }: { project: Project }) {
  const stages = [
    { id: 'sourcing', label: '简历筛选' },
    { id: 'interviewing', label: '面试中' },
    { id: 'offer', label: 'Offer发放' },
    { id: 'onboarding', label: '入职准备' }
  ];
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">招聘进度</h3>
      <div className="relative space-y-12">
        {stages.map((stage, index) => (
          <TimelineStage 
            key={stage.id}
            stage={stage}
            isActive={project.current_stage === stage.id}
            isComplete={project.completed_stages?.includes(stage.id)}
            isLast={index === stages.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
