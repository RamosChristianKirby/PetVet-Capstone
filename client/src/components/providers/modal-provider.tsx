import { useEffect, useState } from "react";

import { SettingsModal } from "../modals/settings-modal";
import { AddVisitModal } from "../modals/add-visit-modal";
import { EditPetDetails } from "../modals/edit-pet-details-modal";

// ModalProvider

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check if the component is not yet mounted, return null.

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <SettingsModal />
      <AddVisitModal />
      <EditPetDetails />
    </>
  );
};