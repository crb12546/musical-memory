import { useState, useEffect } from "react";
import { Badge } from "./badge";
import { Button } from "./button";
import { DataTable } from "./data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";
import { ScrollArea } from "./scroll-area";
import type { Resume, Candidate } from "../../lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { FileText, Mail, Phone } from "lucide-react";

interface CandidateListProps {
  candidates: Candidate[];
  resumes: Resume[];
}

export function CandidateList({ candidates, resumes }: CandidateListProps) {
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    console.log('CandidateList received data:', { candidates, resumes });
    // Simulate loading state for smoother UX
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [candidates, resumes]);

  const columns: ColumnDef<Candidate>[] = [
    {
      accessorKey: "name",
      header: "姓名",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.name}</div>
      ),
    },
    {
      accessorKey: "email",
      header: "邮箱",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-gray-500" />
          <span>{row.original.email}</span>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "电话",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-gray-500" />
          <span>{row.original.phone}</span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ row }) => {
        const statusColors = {
          active: "bg-green-100 text-green-700",
          pending: "bg-yellow-100 text-yellow-700",
          inactive: "bg-gray-100 text-gray-700",
        };
        return (
          <Badge className={statusColors[row.original.status as keyof typeof statusColors]}>
            {row.original.status}
          </Badge>
        );
      },
    },
    {
      id: "resume",
      header: "简历",
      cell: ({ row }) => {
        const candidateResume = resumes.find(
          (resume) => resume.candidate_id === row.original.id
        );
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedResume(candidateResume || null)}
            disabled={!candidateResume}
            className="hover:bg-blue-50"
          >
            {candidateResume ? (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <span className="text-blue-500">查看简历</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400">无简历</span>
              </div>
            )}
          </Button>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-100 rounded animate-pulse" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={candidates}
        searchColumn="name"
      />
      
      {selectedResume && (
        <Dialog open={!!selectedResume} onOpenChange={() => setSelectedResume(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>简历详情</DialogTitle>
            </DialogHeader>
            <ScrollArea className="mt-4">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {selectedResume.tags.map((tag) => (
                    <Badge key={tag.id} variant="secondary">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
                {selectedResume.parsed_content && (
                  <div className="space-y-6">
                    {(() => {
                      const content = JSON.parse(selectedResume.parsed_content);
                      if (content.error) {
                        return (
                          <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                            <p className="font-medium">处理错误</p>
                            <p className="mt-1 text-sm">{content.error}</p>
                          </div>
                        );
                      }

                      const sections = [
                        { title: "工作经验", key: "experience" },
                        { title: "教育背景", key: "education" },
                        { title: "技能", key: "skills" },
                        { title: "项目经历", key: "projects" }
                      ];

                      return (
                        <div className="space-y-6">
                          {sections.map(({ title, key }) => (
                            <div key={key} className="space-y-2">
                              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                              <div className="bg-gray-50 rounded-lg p-4">
                                {Array.isArray(content[key]) ? (
                                  <ul className="list-disc list-inside space-y-2">
                                    {content[key].map((item: string, index: number) => (
                                      <li key={index} className="text-gray-600">{item}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-gray-600">{content[key]}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
