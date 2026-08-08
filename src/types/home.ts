export type HomeFilterItem = {
  id: string;
  label: string;
};

export type HomeListHeaderProps = {
  title: string;
  subtitle: string;
  filters: HomeFilterItem[];
  selectedFilter: string;
  searchValue: string;
  onFilterChange: (filter: string) => void;
  onSearchChange: (value: string) => void;
};
