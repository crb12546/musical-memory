
import { Toaster, toast } from 'sonner'
import { Button } from './components/ui/button'
import { ProjectList } from './components/ui/project-list'
import { ProjectForm } from './components/ui/project-form'
import { ResumeUpload } from './components/ui/resume-upload'
import { CandidateList } from './components/ui/candidate-list'
import { CandidateForm } from './components/ui/candidate-form'
import { InterviewScheduler } from './components/ui/interview-scheduler'
import { InterviewFeedbackForm } from './components/ui/interview-feedback'
import { AnalyticsDashboard } from './components/ui/analytics-dashboard'
import { ProjectTimeline } from './components/ui/project-timeline'
import { SidebarProvider, Sidebar, SidebarMenu } from './components/ui/sidebar'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './components/ui/dialog'
import { Badge } from './components/ui/badge'
import { api } from './lib/api'
import type { Candidate, Project, Interview, Resume, Tag } from './lib/api'
import { cn } from './lib/utils'
import { useState } from 'react'
import useSWR, { SWRConfig } from 'swr'

function AppContent() {
  const [activeSection, setActiveSection] = useState<string>("project-list")
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [showCandidateForm, setShowCandidateForm] = useState(false)

  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const { data: candidates = [], mutate: mutateCandidates } = useSWR<Candidate[]>('/api/candidates', () => api.getCandidates());
  const { data: resumes = [], mutate: mutateResumes } = useSWR<Resume[]>('/api/resumes', () => api.getResumes());
  const { data: projects = [], mutate: mutateProjects } = useSWR<Project[]>('/api/projects', () => api.getProjects());
  const { data: interviews = [], mutate: mutateInterviews } = useSWR<Interview[]>('/api/interviews', () => api.getInterviews());

  const setCandidates = async (data: Candidate[]) => { await mutateCandidates(data); };
  const setResumes = async (data: Resume[]) => { await mutateResumes(data); };
  const setProjects = async (data: Project[]) => { await mutateProjects(data); };
  const setInterviews = async (data: Interview[]) => { await mutateInterviews(data); };

  const renderContent = () => {
    const Section = ({ children, className }: { children: React.ReactNode, className?: string }) => (
      <div className={cn("bg-white rounded-lg p-6 shadow-sm", className)}>
        {children}
      </div>
    );

    const Title = ({ children }: { children: React.ReactNode }) => (
      <h2 className="text-xl font-semibold mb-4">{children}</h2>
    );

    switch (activeSection) {
      case "project-list":
        return (
          <div className="space-y-6">
            <Section>
              <Title>招聘需求列表</Title>
              <div className="flex justify-end mb-4">
                <Button onClick={() => setShowProjectForm(true)}>
                  创建招聘需求
                </Button>
              </div>
              <ProjectList 
                projects={projects}
                onProjectSelect={setSelectedProject}
                onEdit={(project: Project) => {
                  setSelectedProject(project);
                  setShowProjectForm(true);
                }}
                onDelete={async (id: string) => {
                  try {
                    await api.deleteProject(id);
                    toast.success("删除成功");
                    const updatedProjects = await api.getProjects();
                    setProjects(updatedProjects);
                  } catch (error) {
                    toast.error("删除失败：" + (error as Error).message);
                  }
                }}
              />
            </Section>
            <Section>
              <Title>数据分析</Title>
              <AnalyticsDashboard projects={projects} interviews={interviews} />
            </Section>
          </div>
        )
      case "project-create":
        return (
          <div className="space-y-6">
            <Section>
              <Title>创建招聘需求</Title>
              <ProjectForm onSuccess={(data) => {
                setProjects(data);
                setActiveSection("project-list");
                toast.success("招聘需求创建成功");
              }} />
            </Section>
            <Section>
              <Title>已有需求</Title>
              <ProjectList 
                projects={projects}
                onProjectSelect={setSelectedProject}
                onEdit={(project: Project) => {
                  setSelectedProject(project);
                  setShowProjectForm(true);
                }}
                onDelete={async (id: string) => {
                  try {
                    await api.deleteProject(id);
                    toast.success("删除成功");
                    const updatedProjects = await api.getProjects();
                    setProjects(updatedProjects);
                  } catch (error) {
                    toast.error("删除失败：" + (error as Error).message);
                  }
                }}
              />
            </Section>
          </div>
        )
      case "resume-upload":
        return (
          <div className="space-y-6">
            <Section>
              <Title>创建候选人</Title>
              <CandidateForm onSuccess={(data) => setCandidates(data)} />
            </Section>
            <Section>
              <Title>简历录入</Title>
              <ResumeUpload 
                candidates={candidates} 
                onSuccess={(data) => setResumes(data)} 
              />
            </Section>
          </div>
        )
      case "resume-view":
        return (
          <div className="space-y-6">
            <Section>
              <Title>候选人列表</Title>
              <div className="flex justify-end mb-4">
                <Button onClick={() => setShowCandidateForm(true)}>
                  创建候选人
                </Button>
              </div>
              <CandidateList candidates={candidates} resumes={resumes} />
            </Section>
            {showCandidateForm && (
              <Dialog open={showCandidateForm} onOpenChange={setShowCandidateForm}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>创建候选人</DialogTitle>
                  </DialogHeader>
                  <CandidateForm onSuccess={(data) => {
                    setCandidates(data);
                    setShowCandidateForm(false);
                  }} />
                </DialogContent>
              </Dialog>
            )}
          </div>
        )
      case "talent-matching":
        return (
          <Section>
            <Title>人才匹配</Title>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium">招聘需求</h3>
                <div className="grid gap-4">
                  {projects.map(project => (
                    <div 
                      key={project.id}
                      className="p-4 border rounded-lg hover:border-blue-500 cursor-pointer"
                      onClick={() => setSelectedProject(project)}
                    >
                      <h4 className="font-medium">{project.title}</h4>
                      <p className="text-sm text-gray-500">{project.department}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-medium">项目进度</h3>
                {selectedProject ? (
                  <ProjectTimeline project={selectedProject} />
                ) : (
                  <div className="text-gray-500 text-center p-8">
                    请选择一个招聘需求以查看项目进度
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <h3 className="font-medium">匹配候选人</h3>
                {selectedProject ? (
                  <CandidateList 
                    candidates={candidates.filter(c => {
                      const resume = resumes.find(r => r.candidate_id === c.id);
                      return resume?.tags.some((tag: Tag) => 
                        selectedProject.qualifications.toLowerCase().includes(tag.name.toLowerCase())
                      );
                    })}
                    resumes={resumes}
                  />
                ) : (
                  <div className="text-gray-500 text-center p-8">
                    请选择一个招聘需求以查看匹配的候选人
                  </div>
                )}
              </div>
            </div>
          </Section>
        )
      case "interview-schedule":
        return (
          <Section>
            <Title>面试安排</Title>
            {selectedProject ? (
              <InterviewScheduler 
                project={selectedProject}
                candidates={candidates}
                onSuccess={() => {
                  api.getInterviews().then(data => setInterviews(data));
                  setSelectedProject(null);
                }}
              />
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map(project => (
                    <div 
                      key={project.id}
                      className="p-4 border rounded-lg hover:border-blue-500 cursor-pointer transition-colors"
                      onClick={() => setSelectedProject(project)}
                    >
                      <h3 className="font-medium">{project.title}</h3>
                      <p className="text-sm text-gray-500">{project.department}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Section>
        )
      case "interview-feedback":
        return (
          <div className="space-y-6">
            <Section>
              <Title>面试反馈</Title>
              <div className="space-y-6">
                {interviews.filter(i => i.status === 'scheduled').map(interview => {
                  const candidate = candidates.find(c => c.id === interview.candidate_id);
                  const project = projects.find(p => p.id === interview.project_id);
                  return (
                    <div key={interview.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{candidate?.name}</h3>
                          <p className="text-sm text-gray-500">{project?.title}</p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-700">
                          待反馈
                        </Badge>
                      </div>
                      <InterviewFeedbackForm 
                        interview={interview}
                        onSuccess={() => api.getInterviews().then(data => setInterviews(data))}
                      />
                    </div>
                  );
                })}
              </div>
            </Section>
            <Section>
              <Title>历史反馈</Title>
              <div className="space-y-6">
                {interviews.filter(i => i.status !== 'scheduled').map(interview => {
                  const candidate = candidates.find(c => c.id === interview.candidate_id);
                  const project = projects.find(p => p.id === interview.project_id);
                  return (
                    <div key={interview.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{candidate?.name}</h3>
                          <p className="text-sm text-gray-500">{project?.title}</p>
                        </div>
                        <Badge className={cn(
                          interview.status === 'completed' && 'bg-green-100 text-green-700',
                          interview.status === 'cancelled' && 'bg-red-100 text-red-700'
                        )}>
                          {interview.status === 'completed' ? '已完成' : '已取消'}
                        </Badge>
                      </div>
                      {interview.feedback && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{typeof interview.feedback === 'object' ? JSON.stringify(interview.feedback, null, 2) : interview.feedback}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Section>
          </div>
        )
      default:
        return <div>404 - 页面不存在</div>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarProvider>
        <div className="flex h-screen">
          <Sidebar>
            <SidebarMenu 
              activeItem={activeSection}
              onItemSelect={(itemId) => {
                setActiveSection(itemId)
                setSelectedProject(null)
              }}
            />
          </Sidebar>
          <main className="flex-1 p-6 overflow-auto">
            {renderContent()}
          </main>
        </div>
      </SidebarProvider>

      {showProjectForm && (
        <Dialog open={showProjectForm} onOpenChange={setShowProjectForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedProject ? "编辑招聘需求" : "创建招聘需求"}</DialogTitle>
            </DialogHeader>
            <ProjectForm 
              project={selectedProject}
              onSuccess={() => {
                setShowProjectForm(false)
                setSelectedProject(null)
                api.getProjects().then(data => setProjects(data))
              }} 
            />
          </DialogContent>
        </Dialog>
      )}

      {selectedProject && (
        <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>安排面试 - {selectedProject.title}</DialogTitle>
            </DialogHeader>
            <InterviewScheduler
              project={selectedProject}
              candidates={candidates}
              onSuccess={() => {
                setSelectedProject(null)
                api.getInterviews().then(data => setInterviews(data as Interview[]))
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <SWRConfig value={{
      refreshInterval: 3000,
      revalidateOnFocus: true,
      dedupingInterval: 2000,
      fetcher: (url: string) => fetch(`https://musical-memory-api-v1.fly.dev/api${url}`).then(r => r.json())
    }}>
      <AppContent />
    </SWRConfig>
  );
}
