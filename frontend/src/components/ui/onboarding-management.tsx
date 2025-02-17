import { useState } from "react";
import { Button } from "./button";

import { Label } from "./label";
import { Badge } from "./badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import type { Candidate } from "../../lib/api";

interface OnboardingStep {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
  assignee?: string;
  documents?: string[];
}

const defaultSteps: OnboardingStep[] = [
  {
    id: '1',
    title: '入职文件准备',
    status: 'pending',
    dueDate: new Date().toISOString(),
    documents: ['身份证', '学历证书', '离职证明']
  },
  {
    id: '2',
    title: '办公设备配置',
    status: 'pending',
    dueDate: new Date().toISOString(),
    documents: ['设备申请表']
  },
  {
    id: '3',
    title: '入职培训',
    status: 'pending',
    dueDate: new Date().toISOString(),
    documents: ['培训记录表']
  }
];

export function OnboardingManagement({ candidate }: { candidate: Candidate }) {
  const [steps, setSteps] = useState<OnboardingStep[]>(defaultSteps);


  const updateStepStatus = (stepId: string, status: OnboardingStep['status']) => {
    setSteps(prevSteps =>
      prevSteps.map(step =>
        step.id === stepId ? { ...step, status } : step
      )
    );
  };

  const getStatusColor = (status: OnboardingStep['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'in-progress': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: OnboardingStep['status']) => {
    switch (status) {
      case 'pending': return '待处理';
      case 'in-progress': return '进行中';
      case 'completed': return '已完成';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">{candidate.name} 的入职流程</h2>
          <p className="text-gray-500">入职进度跟踪</p>
        </div>
        <Button variant="outline" onClick={() => setSteps(defaultSteps)}>
          重置流程
        </Button>
      </div>

      <div className="space-y-4">
        {steps.map((step) => (
          <div key={step.id} className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="text-sm text-gray-500">
                  截止日期：{new Date(step.dueDate).toLocaleDateString()}
                </p>
              </div>
              <Badge className={getStatusColor(step.status)}>
                {getStatusLabel(step.status)}
              </Badge>
            </div>

            {step.documents && (
              <div className="space-y-2">
                <Label>所需文件</Label>
                <div className="flex flex-wrap gap-2">
                  {step.documents.map((doc, index) => (
                    <Badge key={index} variant="outline">{doc}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <Select
                value={step.status}
                onValueChange={(value: OnboardingStep['status']) => 
                  updateStepStatus(step.id, value)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="更新状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">待处理</SelectItem>
                  <SelectItem value="in-progress">进行中</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  上传文件
                </Button>
                <Button variant="outline" size="sm">
                  添加备注
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
