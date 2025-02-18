import * as React from "react";
import { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { api } from "../../lib/api";
import { toast } from "sonner";
import type { Candidate, Resume, OnSuccessCallback } from "../../lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

export function ResumeUpload({ 
  candidates,
  onSuccess 
}: { 
  candidates: Candidate[];
  onSuccess?: OnSuccessCallback<Resume>;
}) {
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFiles) return;

    const formData = new FormData(e.currentTarget);
    const candidateId = formData.get('candidateId') as string;
    
    setLoading(true);
    try {
      const files = Array.from(selectedFiles);
      for (const file of files) {
        await api.uploadResume(file, candidateId);
      }
      
      toast.success("简历上传成功");
      setSelectedFiles(null);


      e.currentTarget.reset();
      onSuccess?.(await api.getResumes());
    } catch (error) {
      toast.error("简历上传失败");
      console.error('Upload error:', error);
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
