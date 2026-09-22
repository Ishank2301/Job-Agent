import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ApplicationStatus } from "@/lib/types"

const STATUS_COLUMNS: ApplicationStatus[] = [
  "SAVED",
  "APPLIED",
  "ASSESSMENT",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
]

interface KanbanProps {
  applications: any[] // Typed to Application DB Model
}

export function ApplicationKanban({ applications }: KanbanProps) {
  const columns = STATUS_COLUMNS

  // ⚡ Bolt: Group applications by status in a single pass to avoid O(C * N) filtering on every render
  // Expected impact: Eliminates redundant array iterations. Time complexity drops from O(C * N) to O(N).
  const applicationsByStatus = useMemo(() => {
    const grouped = new Map<string, any[]>();
    for (const app of applications) {
      if (!grouped.has(app.status)) {
        grouped.set(app.status, []);
      }
      grouped.get(app.status)!.push(app);
    }
    return grouped;
  }, [applications]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 h-full overflow-x-auto pb-4">
      {columns.map((status) => {
        const cards = applicationsByStatus.get(status) || [];
        return (
          <div key={status} className="flex flex-col bg-surface backdrop-blur-sm border border-line rounded-lg p-3 min-w-[250px]">
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="font-mono text-sm font-semibold text-muted uppercase tracking-wider">
                {status}
              </h3>
              <Badge variant="outline" className="font-mono border-line text-muted">
                {cards.length}
              </Badge>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
              {cards.map((app) => (
                  <Card key={app.id} className="bg-surface-2 border-line hover:border-line-strong transition-colors cursor-pointer">
                    <CardHeader className="p-3 pb-1">
                      <CardTitle className="text-sm text-ink truncate">{app.job.title}</CardTitle>
                      <p className="text-xs text-muted truncate">{app.job.company}</p>
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
        );
      })}
    </div>
  )
}
