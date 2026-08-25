import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ApplicationStatus } from "@/lib/types"

interface KanbanProps {
  applications: any[] // Typed to Application DB Model
}

export function ApplicationKanban({ applications }: KanbanProps) {
  const columns = Object.values(ApplicationStatus)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 h-full overflow-x-auto pb-4">
      {columns.map((status) => (
        <div key={status} className="flex flex-col bg-zinc-900/40 backdrop-blur-sm border border-zinc-800 rounded-lg p-3 min-w-[250px]">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="font-mono text-sm font-semibold text-zinc-400 uppercase tracking-wider">
              {status}
            </h3>
            <Badge variant="outline" className="font-mono border-zinc-700 text-zinc-500">
              {applications.filter(a => a.status === status).length}
            </Badge>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
            {applications
              .filter(a => a.status === status)
              .map((app) => (
                <Card key={app.id} className="bg-zinc-950 border-zinc-800 hover:border-zinc-600 transition-colors cursor-pointer">
                  <CardHeader className="p-3 pb-1">
                    <CardTitle className="text-sm text-zinc-100 truncate">{app.job.title}</CardTitle>
                    <p className="text-xs text-zinc-500 truncate">{app.job.company}</p>
                  </CardHeader>
                  <CardContent className="p-3 pt-1 flex justify-between items-center">
                    <span className="font-mono text-xs text-emerald-500">
                      {app.ats_score ? `${app.ats_score}% ATS` : 'Pending'}
                    </span>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}