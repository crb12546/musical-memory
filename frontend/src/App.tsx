import { Toaster } from 'sonner'
import { ProjectList } from './components/ui/project-list'

export default function App() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">智能招聘平台</h1>
      <ProjectList projects={[]} />
      <Toaster />
    </div>
  )
}
