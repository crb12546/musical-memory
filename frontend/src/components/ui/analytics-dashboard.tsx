import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Progress } from "./progress";
import type { Project, Interview } from "../../lib/api";
import { format } from "date-fns";

interface AnalyticsDashboardProps {
  projects: Project[];
  interviews: Interview[];
}

export function AnalyticsDashboard({ projects, interviews }: AnalyticsDashboardProps) {
  const getProjectProgress = (project: Project) => {
    const stages = ['open', 'in-progress', 'closed'];
    const currentIndex = stages.indexOf(project.status);
    return ((currentIndex + 1) / stages.length) * 100;
  };

  const getProjectStatus = (status: string) => {
    switch (status) {
      case 'open':
        return '需求收集';
      case 'in-progress':
        return '面试中';
      case 'closed':
        return '已完成';
      default:
        return status;
    }
  };

  const getInterviewStats = () => {
    const total = interviews.length;
    const completed = interviews.filter(i => i.status === 'completed').length;
    const scheduled = interviews.filter(i => i.status === 'scheduled').length;
    const cancelled = interviews.filter(i => i.status === 'cancelled').length;

    return {
      total,
      completed,
      scheduled,
      cancelled,
      completionRate: total > 0 ? (completed / total) * 100 : 0
    };
  };

  const interviewStats = getInterviewStats();

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总招聘需求</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">进行中需求</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.filter(p => p.status === 'in-progress').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已安排面试</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interviewStats.scheduled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">面试完成率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {interviewStats.completionRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>招聘进度追踪</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {projects.map((project) => (
              <div key={project.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{project.title}</p>
                    <p className="text-xs text-gray-500">
                      {project.department} · {getProjectStatus(project.status)}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    目标日期: {format(new Date(project.target_date), 'yyyy-MM-dd')}
                  </div>
                </div>
                <Progress value={getProjectProgress(project)} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>需求收集</span>
                  <span>简历筛选</span>
                  <span>面试</span>
                  <span>入职</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
