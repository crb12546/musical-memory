import * as React from "react";
import { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { api } from "../../lib/api";
import { toast } from "sonner";

export function CandidateForm({ onSuccess }: { onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const response = await api.createCandidate({
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        state: 'available',
      });
      if (response && response.id) {
        toast.success("Candidate created successfully");
        e.currentTarget.reset();
        onSuccess?.();
      } else {
        toast.error("Failed to create candidate: Invalid response");
      }
    } catch {
      toast.error("Failed to create candidate: Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" type="tel" required />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Candidate"}
      </Button>
    </form>
  );
}
