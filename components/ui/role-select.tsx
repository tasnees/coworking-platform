"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "./label";

interface RoleSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function RoleSelect({ value, onChange, disabled = false, className = "" }: RoleSelectProps) {
  return (
    <div className={className}>
      <Label htmlFor="role">Account Type</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id="role" className="w-full mt-1">
          <SelectValue placeholder="Select account type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="member">Member</SelectItem>
          <SelectItem value="staff">Staff</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>
      <p className="mt-1 text-xs text-muted-foreground">
        Select the type of account you want to access
      </p>
    </div>
  );
}
