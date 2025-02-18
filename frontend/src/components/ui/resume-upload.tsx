import * as React from "react";
import { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { api } from "../../lib/api";
import { toast } from "sonner";
import type { Candidate } from "../../lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

export function ResumeUpload({ 
  candidates,
  onSuccess 
}: { 
  candidates: Candidate[];
  onSuccess?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFiles) {
      toast.error("请选择文件");
      return;
    }
    
    const formData = new FormData(e.currentTarget);
    const candidateId = formData.get('candidateId') as string;
    if (!candidateId) {
      toast.error("请选择候选人");
      return;
    }

    setLoading(true);
    try {
      const files = Array.from(selectedFiles);
      for (const file of files) {
        if (!file.type.includes('pdf') && !file.type.includes('doc')) {
          throw new Error('仅支持 PDF 和 Word 文档');
        }
        await api.uploadResume(file, candidateId);
      }
      toast.success("简历上传成功");
      setSelectedFiles(null);
      e.currentTarget.reset();
      onSuccess?.();
    } catch (error) {
      toast.error(`上传失败: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="candidateId">Candidate</Label>
        <Select name="candidateId" required>
          <SelectTrigger>
            <SelectValue placeholder="Select a candidate" />
          </SelectTrigger>
          <SelectContent>
            {candidates.map((candidate) => (
              <SelectItem key={candidate.id} value={candidate.id}>
                {candidate.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="file">Resume File</Label>
        <Input
          id="file"
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={(e) => setSelectedFiles(e.target.files)}
          required
        />
      </div>
      <Button type="submit" disabled={loading || !selectedFiles}>
        {loading ? "Uploading..." : "Upload Resume"}
      </Button>
    </form>
  );
}
