import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "./button";
import { Input } from "./input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./form";
import { api } from "../../lib/api";
import type { Candidate, OnSuccessCallback } from "../../lib/api";
import { toast } from "sonner";

const candidateFormSchema = z.object({
  name: z.string().min(2, "姓名至少2个字符"),
  email: z.string().email("请输入有效的邮箱地址"),
  phone: z.string().min(11, "请输入有效的电话号码"),
});

type CandidateFormData = z.infer<typeof candidateFormSchema>;

export function CandidateForm({ 
  onSuccess 
}: { 
  onSuccess?: OnSuccessCallback<Candidate>;
}) {
  const [loading, setLoading] = useState(false);

  const form = useForm<CandidateFormData>({
    resolver: zodResolver(candidateFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
    }
  });

  const onSubmit = async (data: CandidateFormData) => {
    setLoading(true);
    try {
      await api.createCandidate(data);
      toast.success("候选人创建成功");
      form.reset();
      const candidates = await api.getCandidates();
      onSuccess?.(candidates);
    } catch (error) {
      toast.error("创建失败：" + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>姓名</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>邮箱</FormLabel>
              <FormControl>
                <Input {...field} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>电话</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "创建中..." : "创建候选人"}
        </Button>
      </form>
    </Form>
  );
}
