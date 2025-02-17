
import { Toaster } from 'sonner'

import { ProjectList } from './components/ui/project-list'
import { ProjectForm } from './components/ui/project-form'
import { ResumeUpload } from './components/ui/resume-upload'
import { CandidateList } from './components/ui/candidate-list'
import { InterviewScheduler } from './components/ui/interview-scheduler'
import { AnalyticsDashboard } from './components/ui/analytics-dashboard'
import { SidebarProvider, Sidebar, SidebarMenu } from './components/ui/sidebar'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './components/ui/dialog'
import { api } from './lib/api'
import type { Candidate, Project, Interview, Resume } from './lib/types'
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
    switch (activeSection) {
      case "project-list":
        return (
          <>
            <ProjectList 
              projects={projects}
              onProjectSelect={(project) => setSelectedProject(project)}
            />
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">数据分析</h2>
              <AnalyticsDashboard projects={projects} interviews={interviews} />
            </div>
          </>
        )
      case "project-create":
        return (
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">创建招聘需求</h2>
            <ProjectForm onSuccess={() => api.getProjects().then(setProjects)} />
          </div>
        )
      case "resume-upload":
        return (
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">简历录入</h2>
            <ResumeUpload 
              candidates={candidates} 
              onSuccess={() => api.getResumes().then(setResumes)} 
            />
          </div>
        )
      case "resume-view":
        return (
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">简历查看</h2>
            <CandidateList candidates={candidates} resumes={resumes} />
          </div>
        )
      case "interview-schedule":
        return (
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">面试安排</h2>
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
                      className="p-4 border rounded-lg hover:border-blue-500 cursor-pointer"
                      onClick={() => setSelectedProject(project)}
                    >
                      <h3 className="font-medium">{project.title}</h3>
                      <p className="text-sm text-gray-500">{project.department}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
