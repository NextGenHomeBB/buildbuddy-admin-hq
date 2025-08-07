import { Badge } from "@/components/ui/badge";

interface Props {
  employerOrgId: string;
  ownerOrgId?: string;
}

const CompanyChip = ({ employerOrgId, ownerOrgId }: Props) => {
  const isInternal = ownerOrgId && employerOrgId === ownerOrgId;
  return (
    <Badge variant={isInternal ? "default" : "secondary"}>
      {isInternal ? "Internal" : "Vendor"}
    </Badge>
  );
};

export default CompanyChip;
