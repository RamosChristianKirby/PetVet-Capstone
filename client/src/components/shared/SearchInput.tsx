type OnSearchChange = (searchValue: string) => void;

// SearchInput

const SearchInput = ({ onSearchChange }: { onSearchChange: OnSearchChange }) => {
    return (
      <input
        type="text"
        placeholder="Search..."
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full focus:outline-none bg-white text-muted-foreground"
      />
    );
  };
  
  export default SearchInput;
  