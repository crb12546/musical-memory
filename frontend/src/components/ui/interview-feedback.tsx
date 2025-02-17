import { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Textarea } from "./textarea";
import { api } from "../../lib/api";
import { toast } from "sonner";
import type { Interview } from "../../lib/api";

interface InterviewFeedbackFormProps {
  interview: Interview;
  onSuccess?: () => void;
}

export function InterviewFeedbackForm({ interview, onSuccess }: InterviewFeedbackFormProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const feedback = {
        technical_score: parseInt(formData.get('technical_score') as string, 10),
        communication_score: parseInt(formData.get('communication_score') as string, 10),
        culture_fit_score: parseInt(formData.get('culture_fit_score') as string, 10),
        strengths: (formData.get('strengths') as string).split(',').map(s => s.trim()),
        areas_for_improvement: (formData.get('areas_for_improvement') as string).split(',').map(s => s.trim()),
        recommendation: formData.get('recommendation') as string,
        overall_rating: parseFloat(formData.get('overall_rating') as string),
        interviewer_notes: formData.get('interviewer_notes') as string
      };

      await api.updateInterview(interview.id, {
        ...interview,
        status: 'completed',
        feedback: JSON.stringify(feedback)
      });

      toast.success("面试反馈已提交");
      onSuccess?.();
    } catch (error) {
      toast.error("提交失败：" + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="technical_score">技术能力评分 (1-5)</Label>
          <Input
            id="technical_score"
            name="technical_score"
            type="number"
            min="1"
            max="5"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="communication_score">沟通能力评分 (1-5)</Label>
          <Input
            id="communication_score"
            name="communication_score"
            type="number"
            min="1"
            max="5"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="culture_fit_score">文化契合度评分 (1-5)</Label>
          <Input
            id="culture_fit_score"
            name="culture_fit_score"
            type="number"
            min="1"
            max="5"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="overall_rating">综合评分 (1-5)</Label>
          <Input
            id="overall_rating"
            name="overall_rating"
            type="number"
            min="1"
            max="5"
            step="0.1"
            required
          />
        </div>

        <div className="col-span-2 space-y-2">
          <Label htmlFor="strengths">优势 (用逗号分隔)</Label>
          <Input
            id="strengths"
            name="strengths"
            placeholder="例如：技术扎实, 学习能力强, 团队协作好"
            required
          />
        </div>

        <div className="col-span-2 space-y-2">
          <Label htmlFor="areas_for_improvement">待提升方面 (用逗号分隔)</Label>
          <Input
            id="areas_for_improvement"
            name="areas_for_improvement"
            placeholder="例如：项目经验不足, 需要加强系统设计能力"
            required
          />
        </div>

        <div className="col-span-2 space-y-2">
          <Label htmlFor="recommendation">招聘建议</Label>
          <select
            id="recommendation"
            name="recommendation"
            className="w-full rounded-md border border-zinc-200 px-3 py-2"
            required
          >
            <option value="">请选择...</option>
            <option value="strong_hire">强烈推荐</option>
            <option value="hire">建议录用</option>
            <option value="hold">待定</option>
            <option value="reject">不建议录用</option>
          </select>
        </div>

        <div className="col-span-2 space-y-2">
          <Label htmlFor="interviewer_notes">面试记录</Label>
          <Textarea
            id="interviewer_notes"
            name="interviewer_notes"
            placeholder="请记录面试过程中的重要观察和细节..."
            className="min-h-[150px]"
          />
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "提交中..." : "提交面试反馈"}
      </Button>
    </form>
  );
}
