import { useEffect, useState } from "react";
import {
  setupUpdateChecker,
  onUpdateAvailable,
  stopUpdateChecker,
  UpdateEvent,
} from "@/utils/sw-update";

export const useUpdateChecker = () => {
  const [updateEvent, setUpdateEvent] = useState<UpdateEvent | null>(null);

  useEffect(() => {
    // Setup update checking
    setupUpdateChecker();

    // Subscribe to update events
    const unsubscribe = onUpdateAvailable((event) => {
      setUpdateEvent(event);
    });

    // Cleanup
    return () => {
      unsubscribe();
      stopUpdateChecker();
    };
  }, []);

  return updateEvent;
};
