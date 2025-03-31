type DataItem = {
    [key: string]: any;
  };
  
  type FilterCallback = (item: DataItem, query: string) => boolean;
  
// useSearchFilter

  export const useSearchFilter = (
    data: DataItem[], 
    searchQuery: string, 
    filterCallback: FilterCallback
  ) => {
    return data.filter(item => filterCallback(item, searchQuery));
  };
  