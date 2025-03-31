import { Loader } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// NOT IN USE. TODO IMPLEMENT.

// Define spinner size variants using class-variance-authority (cva).

const spinnerVariants = cva(
  "text-muted-foreground animate-spin",
  {
    variants: {
      size: {
        default: "h-4 w-4",
        sm: "h-2 w-2",
        lg: "h-6 w-6",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      size: "default",
    },
  },
);

interface SpinnerProps extends VariantProps<typeof spinnerVariants> { }

// Spinner

export const Spinner = ({ size }: SpinnerProps) => {
  return (

    // Using the Loader component from lucide-react as the spinner.
    // The className is dynamically generated based on the size variant.

    <Loader className={cn(spinnerVariants({ size }))} />
  );
};
