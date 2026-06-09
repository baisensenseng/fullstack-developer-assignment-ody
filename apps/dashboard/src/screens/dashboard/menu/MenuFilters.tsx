import { ListMenuAvailability, type ListMenu200CategoriesItem, type ListMenuAvailability as ListMenuAvailabilityType } from '@ody/api-client';
import { colors, radius, SearchInput, SegmentedButton, spacing, typography } from '@ody/shared';
import { Platform, Pressable, Text, View } from 'react-native';

const pointerStyle = Platform.OS === 'web' ? ({ cursor: 'pointer' } as const) : undefined;
const availabilityFilters: Array<{ label: string; value: ListMenuAvailabilityType }> = [
  { label: 'All items', value: ListMenuAvailability.all },
  { label: 'Available', value: ListMenuAvailability.available },
  { label: 'Unavailable', value: ListMenuAvailability.unavailable },
  { label: 'Archived', value: ListMenuAvailability.archived }
];

export type MenuFiltersProps = {
  availability: ListMenuAvailabilityType;
  onAvailabilityChange: (value: ListMenuAvailabilityType) => void;
  onSearchChange: (value: string) => void;
  onSearchClear: () => void;
  search: string;
};

export type CategoryRailProps = {
  categories: ListMenu200CategoriesItem[];
  onCreateCategory: () => void;
  onEditCategory: (category: ListMenu200CategoriesItem) => void;
  onSelect: (categoryId?: string) => void;
  selectedCategoryId?: string;
};

/**
 * Description: Implements MenuFilters.
 * Parameters: props MenuFiltersProps current filters and filter handlers.
 * Returns: JSX menu filter controls.
 */
export function MenuFilters({ availability, onAvailabilityChange, onSearchChange, onSearchClear, search }: MenuFiltersProps) {
  return (
    <View style={{ position: 'relative', zIndex: 10, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md }}>
      <View style={{ width: 380 }}>
        <SearchInput value={search} placeholder="Search menu" onChangeText={onSearchChange} onClear={onSearchClear} />
      </View>
      {availabilityFilters.map((item) => (
        <SegmentedButton key={item.value} active={availability === item.value} label={item.label} onPress={() => onAvailabilityChange(item.value)} />
      ))}
    </View>
  );
}

/**
 * Description: Implements CategoryRail.
 * Parameters: props CategoryRailProps categories, selected category, and action handlers.
 * Returns: JSX category rail.
 */
export function CategoryRail({ categories, onCreateCategory, onEditCategory, onSelect, selectedCategoryId }: CategoryRailProps) {
  return (
    <View style={{ width: 280, flexShrink: 0, borderWidth: 1, borderColor: colors.borderColor.subtle, borderRadius: radius.lg, backgroundColor: colors.background.elevated, padding: spacing.md }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm }}>
        <Text style={{ color: colors.text.primary, fontSize: typography.cardTitle.fontSize, fontWeight: typography.cardTitle.fontWeight }}>Categories</Text>
        <Pressable accessibilityRole="button" onPress={onCreateCategory} style={[{ minHeight: 32, borderRadius: radius.pill, backgroundColor: colors.background.muted, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md }, pointerStyle]}>
          <Text style={{ color: colors.text.primary, fontSize: typography.caption.fontSize, fontWeight: '900' }}>New</Text>
        </Pressable>
      </View>
      <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
        <SegmentedButton active={!selectedCategoryId} label="All categories" onPress={() => onSelect(undefined)} />
        {categories.map((category) => (
          <View key={category.id} style={{ flexDirection: 'row', gap: spacing.sm }}>
            <View style={{ flex: 1 }}>
              <SegmentedButton active={selectedCategoryId === category.id} label={`${category.name} · ${category.itemCount}`} onPress={() => onSelect(category.id)} />
            </View>
            <Pressable accessibilityRole="button" onPress={() => onEditCategory(category)} style={[{ width: 42, minHeight: 42, borderWidth: 1, borderColor: colors.borderColor.default, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background.elevated }, pointerStyle]}>
              <Text style={{ color: colors.text.primary, fontSize: typography.caption.fontSize, fontWeight: '900' }}>Edit</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}
