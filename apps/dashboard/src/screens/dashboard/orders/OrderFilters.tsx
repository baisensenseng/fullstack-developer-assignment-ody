import type { ListOrders200OrdersItem } from '@ody/api-client';
import { MultiSelectFilter, SearchInput, spacing } from '@ody/shared';
import { View } from 'react-native';
import { channelFilterOptions, fulfillmentFilterOptions, locationFilterOptions, toggleFilterValue } from './order-formatters';

export type OrderFiltersProps = {
  openFilterId: string | null;
  search: string;
  selectedChannels: Array<(typeof channelFilterOptions)[number]['value']>;
  selectedFulfillmentTypes: Array<ListOrders200OrdersItem['fulfillmentType']>;
  selectedLocations: Array<(typeof locationFilterOptions)[number]['value']>;
  setOpenFilterId: (value: string | null) => void;
  setSearch: (value: string) => void;
  setSelectedChannels: (values: Array<(typeof channelFilterOptions)[number]['value']>) => void;
  setSelectedFulfillmentTypes: (values: Array<ListOrders200OrdersItem['fulfillmentType']>) => void;
  setSelectedLocations: (values: Array<(typeof locationFilterOptions)[number]['value']>) => void;
};

/**
 * Description: Implements OrderFilters.
 * Parameters: props OrderFiltersProps controlled search, filter values, and setters.
 * Returns: JSX order search and filter controls.
 */
export function OrderFilters({ openFilterId, search, selectedChannels, selectedFulfillmentTypes, selectedLocations, setOpenFilterId, setSearch, setSelectedChannels, setSelectedFulfillmentTypes, setSelectedLocations }: OrderFiltersProps) {
  return (
    <View style={{ position: 'relative', zIndex: 50, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md }}>
      <View style={{ width: 380 }}>
        <SearchInput value={search} placeholder="Search orders" onChangeText={setSearch} onClear={() => setSearch('')} />
      </View>
      <MultiSelectFilter
        id="type"
        label="Type"
        options={fulfillmentFilterOptions}
        selectedValues={selectedFulfillmentTypes}
        openId={openFilterId}
        setOpenId={setOpenFilterId}
        onToggle={(value) => toggleFilterValue(selectedFulfillmentTypes, value, setSelectedFulfillmentTypes)}
        onSelectAll={() => setSelectedFulfillmentTypes(selectedFulfillmentTypes.length === fulfillmentFilterOptions.length ? [] : fulfillmentFilterOptions.map((item) => item.value))}
      />
      <MultiSelectFilter
        id="channels"
        label="Channels"
        options={[...channelFilterOptions]}
        selectedValues={selectedChannels}
        openId={openFilterId}
        setOpenId={setOpenFilterId}
        onToggle={(value) => toggleFilterValue(selectedChannels, value, setSelectedChannels)}
        onSelectAll={() => setSelectedChannels(selectedChannels.length === channelFilterOptions.length ? [] : channelFilterOptions.map((item) => item.value))}
      />
      <MultiSelectFilter
        id="location"
        label="Location"
        options={[...locationFilterOptions]}
        selectedValues={selectedLocations}
        openId={openFilterId}
        setOpenId={setOpenFilterId}
        onToggle={(value) => toggleFilterValue(selectedLocations, value, setSelectedLocations)}
        onSelectAll={() => setSelectedLocations(selectedLocations.length === locationFilterOptions.length ? [] : locationFilterOptions.map((item) => item.value))}
      />
    </View>
  );
}
