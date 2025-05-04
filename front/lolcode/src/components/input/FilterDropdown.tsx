import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

interface FilterDropdownProps {
  selectedFilter: string;
  onSelectFilter: (filter: string) => void;
  filterOptions: string[];
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  selectedFilter,
  onSelectFilter,
  filterOptions,
}) => {
  return (
    <div className="relative inline-block text-left">
      <Menu>
        <MenuButton className="inline-flex h-[40px] w-[135px] items-center justify-between rounded-md border border-gray-400 bg-white px-[10px] py-[4px] text-[14px] font-medium text-gray-900 shadow-sm hover:bg-gray-50">
          {selectedFilter}
          <span className="material-symbols-outlined text-gray-400">
            keyboard_arrow_down
          </span>
        </MenuButton>
        <MenuItems className="absolute right-0 mt-[2px] w-[135px] origin-top-right rounded-md border border-gray-200 bg-white p-[10px] shadow-lg outline-none">
          {filterOptions.map((option) => (
            <MenuItem key={option}>
              {({ active }) => (
                <button
                  className={`${
                    active ? "bg-gray-200" : "text-gray-900"
                  } group flex w-full items-center rounded-md p-[4px] text-sm`}
                  onClick={() => onSelectFilter(option)}
                >
                  {option}
                </button>
              )}
            </MenuItem>
          ))}
        </MenuItems>
      </Menu>
    </div>
  );
};

export default FilterDropdown;
