import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useBanner } from "@/context/BannerContext";

const GlobalRlsBanner = () => {
  const { banner } = useBanner();
  if (!banner) return null;
  return (
    <div className="p-4">
      <Alert>
        <AlertTitle>Restricted Access</AlertTitle>
        <AlertDescription>{banner.message}</AlertDescription>
      </Alert>
    </div>
  );
};

export default GlobalRlsBanner;
