
import { Toaster } from 'sonner'

import { ProjectList } from './components/ui/project-list'
import { ProjectForm } from './components/ui/project-form'
import { ResumeUpload } from './components/ui/resume-upload'
import { CandidateList } from './components/ui/candidate-list'
import { InterviewScheduler } from './components/ui/interview-scheduler'
import { AnalyticsDashboard } from './components/ui/analytics-dashboard'
import { SidebarProvider, Sidebar, SidebarMenu } from './components/ui/sidebar'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './components/ui/dialog'
import { Badge } from './components/ui/badge'
import { api } from './lib/api'
import type { Candidate, Project, Interview, Resume, Tag } from './lib/types'
import { cn } from './lib/utils'
import { useState, useEffect } from 'react'

export default function App() {
  const [activeSection, setActiveSection] = useState<string>("project-list")
  const [showProjectForm, setShowProjectForm] = useState(false)

  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [resumes, setResumes] = useState<Resume[]>([])
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    Promise.all([
      api.getCandidates(),
      api.getResumes(),
      api.getProjects(),
      api.getInterviews()
    ]).then(([candidatesData, resumesData, projectsData, interviewsData]) => {
      setCandidates(candidatesData)
      setResumes(resumesData)
      setProjects(projectsData)
      setInterviews(interviewsData)
    })
  }, [])

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
              <ProjectList 
                projects={projects}
                onProjectSelect={(project) => setSelectedProject(project)}
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
          <Section>
            <Title>创建招聘需求</Title>
            <ProjectForm onSuccess={() => api.getProjects().then(setProjects)} />
          </Section>
        )
      case "resume-upload":
        return (
          <Section>
            <Title>简历录入</Title>
            <ResumeUpload 
              candidates={candidates} 
              onSuccess={() => api.getResumes().then(setResumes)} 
            />
          </Section>
        )
      case "resume-view":
        return (
          <Section>
            <Title>简历查看</Title>
            <CandidateList candidates={candidates} resumes={resumes} />
          </Section>
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
                  api.getInterviews().then(setInterviews);
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
      case "interview-list":
        return (
          <Section>
            <Title>面试列表</Title>
            <div className="space-y-6">
              {interviews.map(interview => {
                const candidate = candidates.find(c => c.id === interview.candidate_id);
                const project = projects.find(p => p.id === interview.project_id);
                return (
                  <div key={interview.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{candidate?.name}</h3>
                        <p className="text-sm text-gray-500">{project?.title}</p>
                      </div>
                      <Badge>{interview.status}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        );

      case "interview-feedback":
        return (
          <Section>
            <Title>面试反馈</Title>
            <div className="space-y-6">
              {interviews.map(interview => {
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
                        interview.status === 'scheduled' && 'bg-blue-100 text-blue-700',
                        interview.status === 'completed' && 'bg-green-100 text-green-700',
                        interview.status === 'cancelled' && 'bg-red-100 text-red-700'
                      )}>
                        {interview.status}
                      </Badge>
                    </div>
                    {interview.feedback && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-700">{interview.feedback}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Section>
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
                api.getProjects().then(setProjects)
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
                api.getInterviews().then(setInterviews)
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      <Toaster />
    </div>
  )
}
