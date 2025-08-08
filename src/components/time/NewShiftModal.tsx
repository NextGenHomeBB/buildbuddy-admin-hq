import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface NewShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
}

const NewShiftModal = ({ isOpen, onClose, orgId }: NewShiftModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [loading, setLoading] = useState(false);

  const onSave = async () => {
    if (!orgId) {
      toast({ title: "No organization selected", description: "Please select an organization first.", variant: "destructive" });
      return;
    }
    if (!user) {
      toast({ title: "Not signed in", description: "Please sign in to create shifts.", variant: "destructive" });
      return;
    }
    if (!date || !startTime || !endTime) {
      toast({ title: "Missing info", description: "Choose a date and time range.", variant: "destructive" });
      return;
    }

    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const start = new Date(date);
    start.setHours(sh, sm, 0, 0);
    const end = new Date(date);
    end.setHours(eh, em, 0, 0);

    if (end <= start) {
      toast({ title: "Invalid time range", description: "End time must be after start time.", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.from("shifts").insert({
        org_id: orgId,
        user_id: user.id,
        start_at: start.toISOString(),
        end_at: end.toISOString(),
        project_id: null,
      });
      if (error) throw error;
      toast({ title: "Shift created", description: `${start.toLocaleString()} → ${end.toLocaleTimeString()}` });
      onClose();
    } catch (e: any) {
      const msg = e?.message || "Failed to create shift";
      toast({ title: "Could not create shift", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Shift</DialogTitle>
          <DialogDescription>Create a new shift for your team.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Date</Label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="start">Start time</Label>
              <Input id="start" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end">End time</Label>
              <Input id="end" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button type="button" onClick={onSave} disabled={loading}>
              {loading ? "Creating..." : "Create shift"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewShiftModal;
