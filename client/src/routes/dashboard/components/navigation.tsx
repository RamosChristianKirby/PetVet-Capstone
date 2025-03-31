import { ElementRef, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "usehooks-ts";
import { UserItem } from "./user-item";
import { Item } from "./item";
import { useSettings } from "../../../hooks/use-settings";
import { cn } from "../../../lib/utils";
import { PetList } from "./PetList";
import {
  ChevronsLeft,
  MenuIcon,
  PlusCircle,
  Settings,
  MapPin,
  Home,
  PawPrint,
} from "lucide-react";

// Navigation

export const Navigation = () => {
  const navigate = useNavigate();
  const settings = useSettings();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isResizingRef = useRef(false);
  const sidebarRef = useRef<ElementRef<"aside">>(null);
  const navbarRef = useRef<ElementRef<"div">>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(isMobile);

  // useEffect to handle sidebar behavior on mobile and desktop views.

  useEffect(() => {
    if (isMobile) {
      collapse();
    } else {
      resetWidth();
    }
  }, [isMobile]);

  // Handler for initiating the resize of the sidebar.

  const handleMouseDown = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    // Setting the resizing flag to true.

    isResizingRef.current = true;

    // Adding mouse move and mouse up listeners to handle the resizing.

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Handler for resizing the sidebar as the mouse moves.

  const handleMouseMove = (event: MouseEvent) => {

    // If not resizing, exit the function. Optimize performance.

    if (!isResizingRef.current) return;

    // Calculate the new width, constraining it within a min-max range.

    let newWidth = event.clientX;
    if (newWidth < 240) newWidth = 240;
    if (newWidth > 480) newWidth = 480;

    // Apply the new width to the sidebar and adjust the navbar accordingly.

    if (sidebarRef.current && navbarRef.current) {
      sidebarRef.current.style.width = `${newWidth}px`;
      navbarRef.current.style.setProperty("left", `${newWidth}px`);
      navbarRef.current.style.setProperty("width", `calc(100% - ${newWidth}px)`);
    }
  };

  // Handler for when mouse up event occurs, stops the resizing.

  const handleMouseUp = () => {
    isResizingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  // Function to reset the sidebar width to default.

  const resetWidth = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(false);
      setIsResetting(true);

      // Apply default width for mobile and desktop views.

      sidebarRef.current.style.width = isMobile ? "100%" : "240px";
      navbarRef.current.style.setProperty(
        "width",
        isMobile ? "0" : "calc(100% - 240px)"
      );
      navbarRef.current.style.setProperty(
        "left",
        isMobile ? "100%" : "240px"
      );

      // Resetting state after a brief timeout.

      setTimeout(() => setIsResetting(false), 300);
    }
  };

  // collapse i.e. Sidebar collapse.

  const collapse = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(true);
      setIsResetting(true);

      sidebarRef.current.style.width = "0";
      navbarRef.current.style.setProperty("width", "100%");
      navbarRef.current.style.setProperty("left", "0");
      setTimeout(() => setIsResetting(false), 300);
    }
  }

  // Navigation handlers for different routes.
  const handleHomeClick = () => navigate('/dashboard');
  const handleVisitClick = () => navigate('/dashboard/visits');
  const handleCreatePet = () => navigate(`/dashboard/pets/create-pet`);
  const handleOwnersClick = () => navigate('/dashboard/owners');
  const userDetails = JSON.parse(localStorage.getItem('userDetails') || '{}');
  const isDoctor = userDetails.role === 'doctor';

  return (
    <>
      <aside
        ref={sidebarRef}
        className={cn(
          "group/sidebar h-full bg-secondary overflow-y-auto relative flex w-60 flex-col z-[99999]",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "w-0"
        )}
      >
        <div
          onClick={collapse}
          role="button"
          className={cn(
            "h-6 w-6 text-muted-foreground rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 absolute top-3 right-2 opacity-0 group-hover/sidebar:opacity-100 transition",
            isMobile && "opacity-100"
          )}
        >
          <ChevronsLeft className="h-6 w-6" />
        </div>
        <div>
          <UserItem />
          <Item
            label="Settings"
            icon={Settings}
            onClick={() => {
              settings.onOpen();
            }}
          />
          <Item
            label="Home"
            icon={Home}
            onClick={handleHomeClick}
          />
          {isDoctor && (
            <Item
              label="Visits"
              icon={MapPin}
              onClick={handleVisitClick}
            />
          )}
          <Item
            onClick={handleCreatePet}
            label="Add a Pet"
            icon={PlusCircle}
          />
          {isDoctor && (<Item
            label="Owners" // Add Owners item
            icon={PawPrint} // Use any icon (e.g., PawPrint)
            onClick={handleOwnersClick}
          />)}
        </div>
        <div className="mt-4">
          <PetList />
        </div>
        <div
          onMouseDown={handleMouseDown}
          onClick={resetWidth}
          className="opacity-0 group-hover/sidebar:opacity-100 transition cursor-ew-resize absolute h-full w-1 bg-primary/10 right-0 top-0"
        />
      </aside>
      <div
        ref={navbarRef}
        className={cn(
          "absolute top-0 z-[99999] left-60 w-[calc(100%-240px)]",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "left-0 w-full"
        )}
      >
        <nav className="bg-transparent px-3 py-2 w-full">
          {isCollapsed && <MenuIcon onClick={resetWidth} role="button" className="h-6 w-6 text-muted-foreground" />}
        </nav>
      </div>
    </>
  );
};
