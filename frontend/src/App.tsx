import { useState, useEffect } from 'react'
import { Toaster } from 'sonner'
import { Button } from './components/ui/button'
import { Card } from './components/ui/card'
import { ProjectList } from './components/ui/project-list'
import { ProjectForm } from './components/ui/project-form'
import { ResumeUpload } from './components/ui/resume-upload'
import { InterviewScheduler } from './components/ui/interview-scheduler'
import { AnalyticsDashboard } from './components/ui/analytics-dashboard'
import { api } from './lib/api'
import type { Candidate, Project, Interview } from './lib/api'

export default function App() {
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [showResumeUpload, setShowResumeUpload] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    Promise.all([
      api.getCandidates(),
      api.getProjects(),
      api.getInterviews()
    ]).then(([candidatesData, projectsData, interviewsData]) => {
      setCandidates(candidatesData)
      setProjects(projectsData)
      setInterviews(interviewsData)
    })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">智能招聘平台</h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => setShowProjectForm(true)}>
              创建需求
            </Button>
            <Button variant="default" size="sm" onClick={() => setShowResumeUpload(true)}>
              上传简历
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <ProjectList 
          projects={projects}
          onProjectSelect={(project) => setSelectedProject(project)}
        />
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">数据分析</h2>
          <AnalyticsDashboard projects={projects} interviews={interviews} />
        </div>
        {showProjectForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <h2 className="text-xl font-semibold mb-4">{selectedProject ? "编辑招聘需求" : "创建招聘需求"}</h2>
              <ProjectForm 
                project={selectedProject}
                onSuccess={() => {
                  setShowProjectForm(false)
                  setSelectedProject(null)
                  window.location.reload()
                }} 
              />
              <Button 
                variant="outline" 
                className="mt-4 w-full"
                onClick={() => setShowProjectForm(false)}
              >
                取消
              </Button>
            </div>
          </div>
        )}
        {showResumeUpload && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">上传简历</h2>
              <ResumeUpload 
                candidates={candidates}
                onSuccess={() => {
                  setShowResumeUpload(false)
                  window.location.reload()
                }}
              />
              <Button 
                variant="outline" 
                className="mt-4 w-full"
                onClick={() => setShowResumeUpload(false)}
              >
                取消
              </Button>
            </div>
          </div>
        )}
        {selectedProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <h2 className="text-xl font-semibold mb-4">安排面试 - {selectedProject.title}</h2>
              <InterviewScheduler
                project={selectedProject}
                candidates={candidates}
                onSuccess={() => {
                  setSelectedProject(null)
                  window.location.reload()
                }}
              />
              <Button 
                variant="outline" 
                className="mt-4 w-full"
                onClick={() => setSelectedProject(null)}
              >
                取消
              </Button>
            </div>
          </div>
        )}
      </main>
      <Toaster />
    </div>
  )
}
