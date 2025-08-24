"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export type Role = 'member' | 'staff';
export const ROLES = ['member', 'staff'] as const;

interface RoleSelectProps {
  value: Role;
  onChange: (value: Role) => void;
  disabled?: boolean;
  className?: string;
}

export function RoleSelect({
  value,
  onChange,
  disabled = false,
  className = "",
}: RoleSelectProps) {
  const handleValueChange = (newValue: string) => {
    if (ROLES.includes(newValue as Role)) {
      onChange(newValue as Role);
    }
  };

  return (
    <div className={className}>
      <Label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
        Account Type
      </Label>
      <Select
        value={value}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select account type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="member">Member</SelectItem>
          <SelectItem value="staff">Staff</SelectItem>
        </SelectContent>
      </Select>
      <p className="mt-1 text-xs text-gray-500">
        Members can book spaces. Staff have additional management capabilities.
      </p>
    </div>
  );
}