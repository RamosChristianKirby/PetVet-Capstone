import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { AuthContext } from "../../../context/AuthContext";
import { getUserDetails } from "../../../context/UserUtils";
import { ChevronsLeftRight } from "lucide-react";

// UserItem

export const UserItem = () => {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const { email, name } = getUserDetails();

  const handleLogout = () => {

    // Clear user authentication data.

    localStorage.removeItem('token');

    // Update authentication context.

    if (authContext) {
      authContext.setIsAuthenticated(false);
    }

    // Redirect with slight delay.

    setTimeout(() => navigate('/'), 100);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div role="button" className="flex items-center text-sm p-3 w-full hover:bg-primary/5">
          <div className="gap-x-2 flex items-center max-w-[150px]">
            <span className="text-start font-medium line-clamp-1">
              {name}
            </span>
          </div>
          <ChevronsLeftRight className="rotate-90 ml-2 text-muted-foreground h-4 w-4" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-80"
        align="start"
        alignOffset={11}
        forceMount
      >
        <div className="flex flex-col space-y-4 p-2">
          <p className="text-xs font-medium leading-none text-muted-foreground">
            {email}
          </p>
          <div className="flex items-center gap-x-2">
            <div className="rounded-md bg-green-500 p-1">
            </div>
            <div className="space-y-1">
              <p className="text-sm line-clamp-1">
                {name}
              </p>
            </div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="w-full cursor-pointer text-muted-foreground">
          <button onClick={handleLogout}>
            Sign out
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
