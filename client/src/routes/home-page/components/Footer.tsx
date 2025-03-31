// Footer

export const Footer = () => {
  return (
    <div className="border-t">
      <div className="wrapperNav flex items-center w-full p-6 z-50">
      <p className='font-semibold hidden md:flex text-xl cursor-pointer'>
        PetVet
      </p>
        <div className="md:ml-auto w-full justify-between md:justify-end flex items-center gap-x-10 text-muted-foreground">
          <button className="hover:text-neutral-500">
            Privacy Policy
          </button>
          <button className="hover:text-neutral-500">
            Terms & Conditions
          </button>
        </div>
      </div>
    </div>
  );
};