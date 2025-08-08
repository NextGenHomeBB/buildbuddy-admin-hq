import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Mail, UserCheck, UserX } from "lucide-react";
import { OrganizationMember } from "@/hooks/useOrganizationMembers";

interface MemberCardProps {
  member: OrganizationMember;
  onEditRole?: (memberId: string) => void;
  onRemoveMember?: (memberId: string) => void;
  onResendInvite?: (memberId: string) => void;
}

const getRoleColor = (role: string) => {
  switch (role) {
    case "org_admin":
      return "default";
    case "manager":
      return "secondary";
    case "worker":
      return "outline";
    default:
      return "outline";
  }
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case "org_admin":
      return "Admin";
    case "manager":
      return "Manager";
    case "worker":
      return "Worker";
    default:
      return role;
  }
};

const MemberCard = ({ member, onEditRole, onRemoveMember, onResendInvite }: MemberCardProps) => {
  const initials = member.user_name 
    ? member.user_name.split(" ").map(n => n[0]).join("").toUpperCase()
    : member.user_email?.substring(0, 2).toUpperCase() || "??";

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {member.user_name || member.user_email || "Unknown User"}
              </p>
              {member.user_email && member.user_name && (
                <p className="text-xs text-muted-foreground truncate">
                  {member.user_email}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Joined {new Date(member.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant={getRoleColor(member.role)}>
              {getRoleLabel(member.role)}
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEditRole?.(member.user_id)}>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Edit Role
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onResendInvite?.(member.user_id)}>
                  <Mail className="mr-2 h-4 w-4" />
                  Resend Invite
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onRemoveMember?.(member.user_id)}
                  className="text-destructive"
                >
                  <UserX className="mr-2 h-4 w-4" />
                  Remove Member
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MemberCard;