import AppLayout from "@/components/layout/AppLayout";
import Seo from "@/components/seo/Seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MailPlus, Search, MoreHorizontal, UserCheck } from "lucide-react";
import { useOrganizationMembers } from "@/hooks/useOrganizationMembers";
import { useState } from "react";

const People = () => {
  const { data: members, isLoading } = useOrganizationMembers();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMembers = members?.filter(member => {
    const userId = member.user_id || "";
    return userId.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case "org_admin":
        return "bg-primary/10 text-primary border-primary/20";
      case "manager":
        return "bg-accent/10 text-accent border-accent/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getRoleName = (role: string) => {
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

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <AppLayout>
      <Seo title="BuildBuddy — Users" description="Invite and manage users, roles and access." />
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Users</h1>
            <p className="text-muted-foreground mt-1">Invite users and assign roles per organization or site.</p>
          </div>
          <Button variant="hero" className="shadow-[var(--shadow-elevated)]">
            <MailPlus className="h-4 w-4" />
            Invite User
          </Button>
        </div>

        <Card className="shadow-[var(--shadow-subtle)]">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Team Members</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted" />
                      <div>
                        <div className="h-4 w-32 bg-muted rounded mb-1" />
                        <div className="h-3 w-20 bg-muted rounded" />
                      </div>
                    </div>
                    <div className="h-6 w-16 bg-muted rounded" />
                  </div>
                ))}
              </div>
            ) : filteredMembers && filteredMembers.length > 0 ? (
              <div className="space-y-3">
                {filteredMembers.map((member) => (
                  <div key={member.user_id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="" alt="User" />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {getInitials("User")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-foreground">
                          User {member.user_id.slice(0, 8)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Member since {new Date(member.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={getRoleColor(member.role)}>
                        {getRoleName(member.role)}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No users found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? "Try adjusting your search terms." : "Start by inviting team members to your organization."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </AppLayout>
  );
};

export default People;