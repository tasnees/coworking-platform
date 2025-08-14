"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type UserRole = 'member' | 'staff';

interface RoleSelectProps {
  value: UserRole;
  onChange: (value: UserRole) => void;
  disabled?: boolean;
  className?: string;
}

export function RoleSelect({
  value,
  onChange,
  disabled = false,
  className = "",
}: RoleSelectProps) {
  return (
    <div className={className}>
      <Label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
        Account Type
      </Label>
      <Select
        value={value}
        onValueChange={(val) => onChange(val as UserRole)}
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

export default RoleSelect;
