import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
  onInviteSent?: () => void;
}

const InviteUserModal = ({ isOpen, onClose, orgId, onInviteSent }: InviteUserModalProps) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("worker");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !role) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // For now, we'll just add the user directly to organization_members
      // In a real app, you'd send an email invitation
      const { error } = await supabase
        .from("organization_members")
        .insert({
          org_id: orgId,
          user_id: email, // This would be replaced with actual user_id after email verification
          role: role
        });

      if (error) throw error;

      toast({
        title: "Invitation sent",
        description: `User invited successfully with ${role} role`,
      });

      setEmail("");
      setRole("worker");
      onInviteSent?.();
      onClose();
    } catch (error) {
      console.error("Error inviting user:", error);
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite User</DialogTitle>
          <DialogDescription>
            Send an invitation to join your organization
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="worker">Worker</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="org_admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Invitation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InviteUserModal;