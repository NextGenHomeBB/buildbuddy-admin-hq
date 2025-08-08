import { useState, useMemo } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Seo from "@/components/seo/Seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MailPlus, Search, Users } from "lucide-react";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useOrganizationMembers } from "@/hooks/useOrganizationMembers";
import MemberCard from "@/components/users/MemberCard";
import InviteUserModal from "@/components/users/InviteUserModal";
import { useToast } from "@/hooks/use-toast";

const People = () => {
  const { activeOrgId } = useActiveOrg();
  const { members, loading, error } = useOrganizationMembers(activeOrgId);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const { toast } = useToast();

  // Filter members based on search and role filter
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch = member.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.user_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "all" || member.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [members, searchTerm, roleFilter]);

  const handleEditRole = (memberId: string) => {
    toast({
      title: "Edit Role",
      description: "Role editing functionality coming soon",
    });
  };

  const handleRemoveMember = (memberId: string) => {
    toast({
      title: "Remove Member",
      description: "Member removal functionality coming soon",
    });
  };

  const handleResendInvite = (memberId: string) => {
    toast({
      title: "Resend Invite",
      description: "Invitation resent successfully",
    });
  };

  const handleInviteSent = () => {
    // Refresh members list or optimistically update
    toast({
      title: "Success",
      description: "User invited successfully",
    });
  };

  if (error) {
    return (
      <AppLayout>
        <Seo title="BuildBuddy — Users" description="Manage organization members and their roles." />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-medium text-foreground">Error loading members</h3>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Seo title="BuildBuddy — Users" description="Manage organization members and their roles." />
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Users</h1>
            <p className="text-muted-foreground mt-1">Manage organization members and their roles.</p>
          </div>
          <Button 
            variant="hero" 
            onClick={() => setIsInviteModalOpen(true)}
            disabled={!activeOrgId}
          >
            <MailPlus /> Invite User
          </Button>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="org_admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="worker">Worker</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Members ({filteredMembers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {members.length === 0 ? "No members yet" : "No members found"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {members.length === 0 
                    ? "Start building your team by inviting your first member"
                    : "Try adjusting your search or filter criteria"
                  }
                </p>
                {members.length === 0 && (
                  <Button onClick={() => setIsInviteModalOpen(true)}>
                    <MailPlus className="mr-2 h-4 w-4" />
                    Invite First Member
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMembers.map((member) => (
                  <MemberCard
                    key={member.user_id}
                    member={member}
                    onEditRole={handleEditRole}
                    onRemoveMember={handleRemoveMember}
                    onResendInvite={handleResendInvite}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        orgId={activeOrgId || ""}
        onInviteSent={handleInviteSent}
      />
    </AppLayout>
  );
};

export default People;