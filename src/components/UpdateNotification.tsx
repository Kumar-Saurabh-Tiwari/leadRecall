import { useEffect, useState } from "react";
import { useUpdateChecker } from "@/hooks/use-update-checker";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export const UpdateNotification = () => {
  const updateEvent = useUpdateChecker();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (updateEvent) {
      setShow(true);

      // Auto-hide success messages after 5 seconds
      if (updateEvent.type === "updated") {
        const timer = setTimeout(() => {
          setShow(false);
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [updateEvent]);

  if (!show || !updateEvent) {
    return null;
  }

  const isError = updateEvent.type === "error";
  const isSuccess = updateEvent.type === "updated";

  return (
    <div className="fixed bottom-20 right-4 z-50 max-w-sm">
      <Alert
        variant={isError ? "destructive" : "default"}
        className={
          isSuccess ? "border-green-500 bg-green-50" : undefined
        }
      >
        {isError ? (
          <AlertCircle className="h-4 w-4" />
        ) : isSuccess ? (
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        ) : (
          <AlertCircle className="h-4 w-4" />
        )}
        <AlertTitle className={isSuccess ? "text-green-900" : undefined}>
          {updateEvent.type === "update-available"
            ? "Update Available"
            : updateEvent.type === "updated"
              ? "App Updated"
              : "Update Error"}
        </AlertTitle>
        <AlertDescription className={isSuccess ? "text-green-800" : undefined}>
          {updateEvent.message}
        </AlertDescription>
        {updateEvent.type === "update-available" && (
          <div className="mt-4 flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                setShow(false);
              }}
              variant="outline"
            >
              Later
            </Button>
          </div>
        )}
      </Alert>
    </div>
  );
};
