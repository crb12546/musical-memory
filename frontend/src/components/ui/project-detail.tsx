import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";
import { Badge } from "./badge";
import { ScrollArea } from "./scroll-area";
import type { Project } from "../../lib/api";
import { format } from "date-fns";

// Helper function to parse JSON strings
const parseJsonString = (str: string): string[] => {
  try {
    return JSON.parse(str);
  } catch {
    return str.split(", ");
  }
};

export function ProjectDetail({ 
  project,
  onClose
}: { 
  project: Project;
  onClose: () => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'open': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'on-hold': return 'bg-yellow-500';
      case 'closed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getJobTypeLabel = (type: string) => {
    switch (type) {
      case 'full-time': return '全职';
      case 'part-time': return '兼职';
      case 'contract': return '合同工';
      default: return type;
    }
  };

  const getJobLevelLabel = (level: string) => {
    switch (level) {
      case 'entry': return '初级';
      case 'mid': return '中级';
      case 'senior': return '高级';
      case 'lead': return '领导';
      default: return level;
    }
  };

  const getRemotePolicyLabel = (policy: string) => {
    switch (policy) {
      case 'office': return '办公室';
      case 'hybrid': return '混合';
      case 'remote': return '远程';
      default: return policy;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'low': return '低';
      case 'normal': return '普通';
      case 'high': return '高';
      case 'urgent': return '紧急';
      default: return priority;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return '草稿';
      case 'open': return '进行中';
      case 'in-progress': return '面试中';
      case 'on-hold': return '暂停';
      case 'closed': return '已完成';
      default: return status;
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">{project.title}</DialogTitle>
            <Badge className={getStatusColor(project.status)}>
              {getStatusLabel(project.status)}
            </Badge>
          </div>
        </DialogHeader>
        
        <ScrollArea className="mt-4 h-full">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">部门：</span>
                {project.department}
              </div>
              <div>
                <span className="text-gray-500">招聘人数：</span>
                {project.headcount}
              </div>
              <div>
                <span className="text-gray-500">工作类型：</span>
                {getJobTypeLabel(project.job_type)}
              </div>
              <div>
                <span className="text-gray-500">职级：</span>
                {getJobLevelLabel(project.job_level)}
              </div>
              <div>
                <span className="text-gray-500">工作地点：</span>
                {project.location}
              </div>
              <div>
                <span className="text-gray-500">远程政策：</span>
                {getRemotePolicyLabel(project.remote_policy)}
              </div>
              <div>
                <span className="text-gray-500">薪资范围：</span>
                {project.salary_range || '未设置'}
              </div>
              <div>
                <span className="text-gray-500">优先级：</span>
                {getPriorityLabel(project.priority)}
              </div>
              <div>
                <span className="text-gray-500">目标日期：</span>
                {format(new Date(project.target_date), 'yyyy-MM-dd')}
              </div>
              <div>
                <span className="text-gray-500">创建时间：</span>
                {format(new Date(project.created_at), 'yyyy-MM-dd HH:mm')}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="font-semibold">职位描述</h3>
              <p className="text-sm whitespace-pre-wrap">{project.description}</p>
            </div>

            {/* Responsibilities */}
            <div className="space-y-2">
              <h3 className="font-semibold">工作职责</h3>
              <ul className="list-disc list-inside text-sm space-y-1">
                {parseJsonString(project.responsibilities).map((responsibility, index) => (
                  <li key={index}>{responsibility}</li>
                ))}
              </ul>
            </div>

            {/* Qualifications */}
            <div className="space-y-2">
              <h3 className="font-semibold">任职要求</h3>
              <ul className="list-disc list-inside text-sm space-y-1">
                {parseJsonString(project.qualifications).map((qualification, index) => (
                  <li key={index}>{qualification}</li>
                ))}
              </ul>
            </div>

            {/* Benefits */}
            {project.benefits && (
              <div className="space-y-2">
                <h3 className="font-semibold">福利待遇</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {parseJsonString(project.benefits).map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
