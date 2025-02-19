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
  const [uploadProgress, setUploadProgress] = useState<number>(0);
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
      setUploadProgress(0);
      const files = Array.from(selectedFiles);
      
      for (const file of files) {
        await api.uploadResume(file, candidateId, setUploadProgress);
      }
      
      toast.success("简历上传成功");
      setSelectedFiles(null);
      setUploadProgress(0);
      e.currentTarget.reset();
      onSuccess?.();
    } catch (error) {
      const errorMessage = (error as Error).message;
      toast.error(errorMessage);
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
      <div className="space-y-2">
        {(loading || uploadProgress > 0) && (
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
        <Button 
          type="submit" 
          disabled={loading || !selectedFiles}
          className="w-full"
        >
          {loading ? `上传中 ${uploadProgress}%` : "上传简历"}
        </Button>
      </div>
    </form>
  );
}
