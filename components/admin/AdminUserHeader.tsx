'use client';

import { useAuth } from '@/lib/authContext';
import { UserDropdown } from '@/components/user/UserDropdown';

interface AdminUserHeaderProps {
  onAddStationClick?: () => void;
}

export function AdminUserHeader({ onAddStationClick }: AdminUserHeaderProps) {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="flex items-center">
      <UserDropdown onAddStationClick={onAddStationClick} />
    </div>
  );
}
