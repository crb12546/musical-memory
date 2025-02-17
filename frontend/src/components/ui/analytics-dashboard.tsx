import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Progress } from "./progress";
import type { Project, Interview, Resume } from "../../lib/api";
import { format } from "date-fns";
import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from "lucide-react";

interface AnalyticsDashboardProps {
  projects: Project[];
  interviews: Interview[];
  resumes: Resume[];
}

export function AnalyticsDashboard({ projects, interviews, resumes }: AnalyticsDashboardProps) {
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

  const calculateProcessingEfficiency = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentResumes = resumes.filter(r => new Date(r.created_at) >= thirtyDaysAgo);
    const previousResumes = resumes.filter(r => {
      const date = new Date(r.created_at);
      return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    });

    const recentEfficiency = recentResumes.filter(r => r.parsed_content).length / (recentResumes.length || 1);
    const previousEfficiency = previousResumes.filter(r => r.parsed_content).length / (previousResumes.length || 1);

    return {
      value: Math.round(recentEfficiency * 100),
      trend: {
        value: Math.round((recentEfficiency - previousEfficiency) * 100),
        label: "vs 上月",
        direction: recentEfficiency > previousEfficiency ? "up" : recentEfficiency < previousEfficiency ? "down" : "neutral"
      }
    };
  };

  const calculateInterviewConversion = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentInterviews = interviews.filter(i => new Date(i.created_at) >= thirtyDaysAgo);
    const previousInterviews = interviews.filter(i => {
      const date = new Date(i.created_at);
      return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    });

    const recentConversion = recentInterviews.filter(i => i.status === "completed").length / (recentInterviews.length || 1);
    const previousConversion = previousInterviews.filter(i => i.status === "completed").length / (previousInterviews.length || 1);

    return {
      value: Math.round(recentConversion * 100),
      trend: {
        value: Math.round((recentConversion - previousConversion) * 100),
        label: "vs 上月",
        direction: recentConversion > previousConversion ? "up" : recentConversion < previousConversion ? "down" : "neutral"
      }
    };
  };

  const calculateRecruitmentCycle = () => {
    const completedProjects = projects.filter(p => p.status === "closed");
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentProjects = completedProjects.filter(p => new Date(p.created_at) >= thirtyDaysAgo);
    const previousProjects = completedProjects.filter(p => {
      const date = new Date(p.created_at);
      return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    });

    const calculateAverageCycle = (projects: Project[]) => {
      if (projects.length === 0) return 0;
      return projects.reduce((sum, p) => {
        const start = new Date(p.created_at);
        const end = new Date(p.updated_at || p.created_at);
        return sum + (end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000);
      }, 0) / projects.length;
    };

    const recentCycle = calculateAverageCycle(recentProjects);
    const previousCycle = calculateAverageCycle(previousProjects);

    return {
      value: Math.round(recentCycle),
      trend: {
        value: Math.round(((previousCycle - recentCycle) / (previousCycle || 1)) * 100),
        label: "vs 上月",
        direction: recentCycle < previousCycle ? "up" : recentCycle > previousCycle ? "down" : "neutral"
      }
    };
  };

  const efficiency = calculateProcessingEfficiency();
  const conversion = calculateInterviewConversion();
  const cycle = calculateRecruitmentCycle();

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">简历处理效率</CardTitle>
            <div className="flex items-center space-x-1">
              {efficiency.trend.direction === "up" ? (
                <ArrowUpIcon className="h-4 w-4 text-green-500" />
              ) : efficiency.trend.direction === "down" ? (
                <ArrowDownIcon className="h-4 w-4 text-red-500" />
              ) : (
                <MinusIcon className="h-4 w-4 text-gray-500" />
              )}
              <span className={`text-xs font-medium ${
                efficiency.trend.direction === "up" ? "text-green-500" :
                efficiency.trend.direction === "down" ? "text-red-500" :
                "text-gray-500"
              }`}>
                {efficiency.trend.value}% {efficiency.trend.label}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{efficiency.value}%</div>
            <p className="text-xs text-gray-500">成功解析的简历百分比</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">面试转化率</CardTitle>
            <div className="flex items-center space-x-1">
              {conversion.trend.direction === "up" ? (
                <ArrowUpIcon className="h-4 w-4 text-green-500" />
              ) : conversion.trend.direction === "down" ? (
                <ArrowDownIcon className="h-4 w-4 text-red-500" />
              ) : (
                <MinusIcon className="h-4 w-4 text-gray-500" />
              )}
              <span className={`text-xs font-medium ${
                conversion.trend.direction === "up" ? "text-green-500" :
                conversion.trend.direction === "down" ? "text-red-500" :
                "text-gray-500"
              }`}>
                {conversion.trend.value}% {conversion.trend.label}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversion.value}%</div>
            <p className="text-xs text-gray-500">完成面试的候选人比例</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均招聘周期</CardTitle>
            <div className="flex items-center space-x-1">
              {cycle.trend.direction === "up" ? (
                <ArrowUpIcon className="h-4 w-4 text-green-500" />
              ) : cycle.trend.direction === "down" ? (
                <ArrowDownIcon className="h-4 w-4 text-red-500" />
              ) : (
                <MinusIcon className="h-4 w-4 text-gray-500" />
              )}
              <span className={`text-xs font-medium ${
                cycle.trend.direction === "up" ? "text-green-500" :
                cycle.trend.direction === "down" ? "text-red-500" :
                "text-gray-500"
              }`}>
                {cycle.trend.value}% {cycle.trend.label}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cycle.value}天</div>
            <p className="text-xs text-gray-500">从发布到完成的平均天数</p>
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
