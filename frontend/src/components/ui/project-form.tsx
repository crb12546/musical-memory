import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Textarea } from "./textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./form";
import { api } from "../../lib/api";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";
import { Info } from "lucide-react";

const projectFormSchema = z.object({
  title: z.string().min(2, "职位名称至少2个字符"),
  department: z.string().min(2, "部门名称至少2个字符"),
  headcount: z.number().min(1, "招聘人数至少1人"),
  job_type: z.enum(["full-time", "part-time", "contract"], {
    required_error: "请选择工作类型",
  }),
  job_level: z.enum(["entry", "mid", "senior", "lead"], {
    required_error: "请选择职级",
  }),
  location: z.string().min(2, "请填写工作地点"),
  remote_policy: z.enum(["office", "hybrid", "remote"], {
    required_error: "请选择远程工作政策",
  }),
  salary_range: z.string().optional(),
  description: z.string().min(10, "职位描述至少10个字符"),
  responsibilities: z.array(z.string()).min(1, "至少添加一项工作职责"),
  qualifications: z.array(z.string()).min(1, "至少添加一项任职要求"),
  benefits: z.array(z.string()).optional(),
  priority: z.enum(["low", "normal", "high", "urgent"], {
    required_error: "请选择优先级",
  }),
  target_date: z.string().min(1, "请选择目标完成日期"),
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

const jobTypeOptions = [
  { value: "full-time", label: "全职" },
  { value: "part-time", label: "兼职" },
  { value: "contract", label: "合同工" },
];

const jobLevelOptions = [
  { value: "entry", label: "初级" },
  { value: "mid", label: "中级" },
  { value: "senior", label: "高级" },
  { value: "lead", label: "领导" },
];

const remotePolicyOptions = [
  { value: "office", label: "办公室" },
  { value: "hybrid", label: "混合" },
  { value: "remote", label: "远程" },
];

const priorityOptions = [
  { value: "low", label: "低" },
  { value: "normal", label: "普通" },
  { value: "high", label: "高" },
  { value: "urgent", label: "紧急" },
];

export function ProjectForm({ onSuccess }: { onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [responsibilities, setResponsibilities] = useState<string[]>(['负责核心系统架构设计和开发']);
  const [qualifications, setQualifications] = useState<string[]>(['5年以上相关开发经验']);
  const [benefits, setBenefits] = useState<string[]>(['具有竞争力的薪资待遇']);


  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: '高级软件工程师',
      department: '技术部',
      headcount: 1,
      job_type: 'full-time',
      job_level: 'mid',
      location: '上海',
      remote_policy: 'office',
      salary_range: '30k-50k',
      description: '我们正在寻找一位经验丰富的高级软件工程师加入我们的团队，负责核心系统的设计和开发。',
      responsibilities: [''],
      qualifications: [''],
      benefits: [''],
      priority: 'normal',
      target_date: new Date().toISOString().split('T')[0],
    }
  });

  const onSubmit = async (data: ProjectFormData) => {
    setLoading(true);
    try {
      await api.createProject({
        ...data,
        responsibilities: JSON.stringify(data.responsibilities),
        qualifications: JSON.stringify(data.qualifications),
        benefits: data.benefits ? JSON.stringify(data.benefits) : undefined,
      });
      toast.success("招聘需求创建成功");
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error("创建失败：" + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const addListItem = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    setList([...list, '']);
  };

  const removeListItem = (index: number, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (list.length > 1) {
      const newList = list.filter((_, i) => i !== index);
      setList(newList);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>职位名称</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>部门</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="headcount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>招聘人数</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={1} 
                    {...field} 
                    onChange={e => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="job_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>工作类型</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择工作类型" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {jobTypeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="job_level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>职级</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择职级" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {jobLevelOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>工作地点</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="remote_policy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>远程工作政策</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择远程工作政策" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {remotePolicyOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="salary_range"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  薪资范围
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 ml-1 inline-block text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>例如：15k-25k或面议</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="例如：15k-25k" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>优先级</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择优先级" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {priorityOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="target_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>目标完成日期</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>职位描述</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  rows={4}
                  placeholder="请详细描述该职位的工作内容、要求等"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div>
            <Label>工作职责</Label>
            {responsibilities.map((_, index) => (
              <div key={index} className="flex gap-2 mt-2">
                <FormField
                  control={form.control}
                  name={`responsibilities.${index}`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input {...field} placeholder={`职责 ${index + 1}`} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeListItem(index, responsibilities, setResponsibilities)}
                  disabled={responsibilities.length <= 1}
                >
                  -
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => addListItem(responsibilities, setResponsibilities)}
            >
              添加职责
            </Button>
          </div>

          <div>
            <Label>任职要求</Label>
            {qualifications.map((_, index) => (
              <div key={index} className="flex gap-2 mt-2">
                <FormField
                  control={form.control}
                  name={`qualifications.${index}`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input {...field} placeholder={`要求 ${index + 1}`} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeListItem(index, qualifications, setQualifications)}
                  disabled={qualifications.length <= 1}
                >
                  -
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => addListItem(qualifications, setQualifications)}
            >
              添加要求
            </Button>
          </div>

          <div>
            <Label>福利待遇</Label>
            {benefits.map((_, index) => (
              <div key={index} className="flex gap-2 mt-2">
                <FormField
                  control={form.control}
                  name={`benefits.${index}`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input {...field} placeholder={`福利 ${index + 1}`} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeListItem(index, benefits, setBenefits)}
                  disabled={benefits.length <= 1}
                >
                  -
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => addListItem(benefits, setBenefits)}
            >
              添加福利
            </Button>
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "创建中..." : "创建招聘需求"}
        </Button>
      </form>
    </Form>
  );
}
