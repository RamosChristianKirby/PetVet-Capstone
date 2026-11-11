import { SettingsModal } from "../modals/settings-modal";
import { AddVisitModal } from "../modals/add-visit-modal";
import { EditPetDetails } from "../modals/edit-pet-details-modal";
import { useEffect } from "react";
import { useSettings } from "../../hooks/use-settings";
import { useVisit } from "../../hooks/use-visit";
import { useEditDetails } from "../../hooks/use-pet-details";
export const ModalProvider = () => {
  useEffect(
    () => () => {
      useSettings.getState().onClose();
      useVisit.getState().onClose();
      useEditDetails.getState().onClose();
    },
    [],
  );
  return (
    <>
      <SettingsModal />
      <AddVisitModal />
      <EditPetDetails />
    </>
  );
};
