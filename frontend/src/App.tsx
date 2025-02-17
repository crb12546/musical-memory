import { Toaster } from 'sonner'
import { ProjectList } from './components/ui/project-list'
import { Button } from './components/ui/button'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">智能招聘平台</h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              创建需求
            </Button>
            <Button variant="default" size="sm">
              上传简历
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <ProjectList projects={[]} />
      </main>
      <Toaster />
    </div>
  )
}
