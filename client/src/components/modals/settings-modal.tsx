import emailjs from "emailjs-com";
import { useState } from "react";
import { useSettings } from "../../hooks/use-settings";
import { Label } from "../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "../../components/ui/dialog";
import { Switch } from "../../components/ui/switch";

// SettingsModal
export const SettingsModal = () => {
  const settings = useSettings();
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleEmailToggle = () => {
    setEmailNotifications((prev) => !prev);
  };

  const handleContactDialogOpen = () => {
    setIsContactDialogOpen(true);
  };

  const handleContactDialogClose = () => {
    setIsContactDialogOpen(false);
    setErrorMessage(""); // Reset error when closing dialog
  };

  const handleFormSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage(""); // Reset error message before submitting

    // Client-side validation
    if (!formData.name || !formData.email || !formData.message) {
      setErrorMessage("All fields are required.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Send the email via EmailJS
      await emailjs.send(
        "service_wrg1bid", // Replace with your EmailJS service ID
        "template_bsfhl4n", // Replace with your EmailJS template ID
        formData,
        "BeO0Y8BzczIjzvHdB" // Replace with your EmailJS user ID
      );

      // Show success popup after successful submission
      setShowSuccessPopup(true);
      setIsContactDialogOpen(false);
    } catch (error: any) {
      setErrorMessage("Failed to send message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessPopupClose = () => {
    setShowSuccessPopup(false); // Close the success popup
  };

  return (
    <Dialog open={settings.isOpen} onOpenChange={settings.onClose}>
      <DialogContent>
        <DialogHeader className="border-b pb-3">
          <h2 className="text-lg font-medium">My settings</h2>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-4">
          {/* Email Notifications Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-y-1">
              <Label>Email Notifications</Label>
              <span className="text-[0.8rem] text-muted-foreground">
                Receive updates and notifications via email
              </span>
            </div>
            <Switch checked={emailNotifications} onCheckedChange={handleEmailToggle} />
          </div>

          {/* Contact Us */}
          <div className="flex flex-col gap-y-1">
            <Label>Contact Us</Label>
            <button
              onClick={handleContactDialogOpen}
              className="text-blue-500 underline hover:text-blue-700"
            >
              Click here to contact us
            </button>
          </div>
        </div>
      </DialogContent>

      {/* Contact Us Dialog */}
      <Dialog open={isContactDialogOpen} onOpenChange={handleContactDialogClose}>
        <DialogContent>
          <DialogHeader className="border-b pb-3">
            <h2 className="text-lg font-medium">Contact Us</h2>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-4">
            <div className="flex flex-col gap-y-1">
              <Label htmlFor="name">Name</Label>
              <input
                id="name"
                type="text"
                placeholder="Your name"
                className="border rounded p-2"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex flex-col gap-y-1">
              <Label htmlFor="email">Email</Label>
              <input
                id="email"
                type="email"
                placeholder="Your email"
                className="border rounded p-2"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex flex-col gap-y-1">
              <Label htmlFor="message">Message</Label>
              <textarea
                id="message"
                placeholder="Your message"
                className="border rounded p-2 h-24"
                value={formData.message}
                onChange={handleInputChange}
              />
            </div>
            {/* Display error message if any */}
            {errorMessage && (
              <div className="text-red-500 text-sm">{errorMessage}</div>
            )}
            <button
              onClick={handleFormSubmit}
              disabled={isSubmitting}
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Popup */}
      <Dialog open={showSuccessPopup} onOpenChange={handleSuccessPopupClose}>
        <DialogContent>
          <DialogHeader className="border-b pb-3">
            <h2 className="text-lg font-medium">Success</h2>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-4">
            <div className="text-green-500">Your message has been successfully sent!</div>
            <button
              onClick={handleSuccessPopupClose}
              className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};
