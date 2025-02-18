import { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Textarea } from "./textarea";
import { api } from "../../lib/api";
import { toast } from "sonner";
import type { Project, Candidate } from "../../lib/types";

export function InterviewScheduler({
  project,
  candidates,
  onSuccess
}: {
  project: Project;
  candidates: Candidate[];
  onSuccess?: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const candidateId = formData.get('candidate_id') as string;
    const scheduledTime = formData.get('scheduled_time') as string;
    const status = formData.get('status') as string || 'scheduled';
    const feedback = formData.get('feedback') as string;
    const rating = formData.get('rating') as string;
    const interviewType = formData.get('interview_type') as string;
    
    if (!candidateId) {
      toast.error("请选择候选人");
      return;
    }
    
    if (!scheduledTime) {
      toast.error("请选择面试时间");
      return;
    }

    if (status === 'completed' && !rating) {
      toast.error("已完成的面试必须提供评分");
      return;
    }

    if (status === 'completed' && !feedback) {
      toast.error("已完成的面试必须提供反馈");
      return;
    }

    setLoading(true);

      const interviewData = {
        project_id: project.id,
        candidate_id: formData.get('candidate_id') as string,
        scheduled_time: new Date(formData.get('scheduled_time') as string).toISOString(),
        status,
        feedback: feedback ? JSON.stringify({
          type: interviewType,
          rating: parseInt(rating || '0', 10),
          comments: feedback
        }) : undefined
      };

      await api.createInterview(interviewData);
      toast.success(status === 'scheduled' ? "面试已安排" : "面试已更新");
      e.currentTarget.reset();
      onSuccess?.();
    } catch (error) {
      toast.error("操作失败：" + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="candidate_id">候选人</Label>
          <Select name="candidate_id" required>
            <SelectTrigger>
              <SelectValue placeholder="选择候选人" />
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
          <Label htmlFor="scheduled_time">面试时间</Label>
          <Input
            id="scheduled_time"
            name="scheduled_time"
            type="datetime-local"
            required
            min={new Date().toISOString().split('.')[0]}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="interview_type">面试类型</Label>
          <Select name="interview_type" defaultValue="technical" required>
            <SelectTrigger>
              <SelectValue placeholder="选择面试类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technical">技术面试</SelectItem>
              <SelectItem value="hr">HR面试</SelectItem>
              <SelectItem value="manager">主管面试</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">面试状态</Label>
          <Select name="status" defaultValue="scheduled" required>
            <SelectTrigger>
              <SelectValue placeholder="选择面试状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled">已安排</SelectItem>
              <SelectItem value="in-progress">进行中</SelectItem>
              <SelectItem value="completed">已完成</SelectItem>
              <SelectItem value="cancelled">已取消</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rating">面试评分</Label>
          <Select name="rating" defaultValue="0">
            <SelectTrigger>
              <SelectValue placeholder="选择评分" />
            </SelectTrigger>
            <SelectContent>
              {[0,1,2,3,4,5].map((score) => (
                <SelectItem key={score} value={score.toString()}>
                  {score === 0 ? '未评分' : '★'.repeat(score)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2 space-y-2">
          <Label htmlFor="feedback">面试反馈</Label>
          <Textarea
            name="feedback"
            placeholder="请输入面试反馈..."
            className="min-h-[120px]"
          />
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "处理中..." : "安排面试"}
      </Button>
    </form>
  );
}
