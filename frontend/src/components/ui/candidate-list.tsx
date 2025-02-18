import { useState, useEffect } from "react";
import { Button } from "./button";

import { DataTable } from "./data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";
import type { Resume, Candidate } from "../../lib/api";
import { ColumnDef } from "@tanstack/react-table";
import { FileText, Mail, Phone } from "lucide-react";
import { ResumePreview } from "./resume-preview";

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
      id: "created_at",
      header: "创建时间",
      cell: ({ row }) => {
        const date = new Date(row.original.created_at);
        return (
          <div className="text-sm text-gray-500">
            {date.toLocaleDateString()}
          </div>
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
            <ResumePreview resume={selectedResume} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
