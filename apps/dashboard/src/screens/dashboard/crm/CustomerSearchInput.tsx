import { SearchInput } from '@ody/shared';

export type CustomerSearchInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  onClear: () => void;
};

/**
 * Description: Implements CustomerSearchInput.
 * Parameters: props CustomerSearchInputProps search value and handlers.
 * Returns: JSX rounded search input.
 */
export function CustomerSearchInput({ onChangeText, onClear, value }: CustomerSearchInputProps) {
  return <SearchInput value={value} placeholder="Search customers" onChangeText={onChangeText} onClear={onClear} />;
}
