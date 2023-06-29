import { MultiSelect, Option } from "react-multi-select-component";
import { api } from "../../../utils/api";

export type TagMultiSelectProps = {
  value: Option[];
  onChange: (nextValue: Option[]) => void;
};

export default function TagMultiSelect(props: TagMultiSelectProps) {
  const { value = [], onChange } = props;

  const tagsCountQuery = api.tags.getCount.useQuery();
  const tagsQuery = api.tags.getAll.useQuery(
    { take: tagsCountQuery.data?.count ?? 0 },
    { enabled: tagsCountQuery.data?.count !== undefined }
  );

  return (
    <MultiSelect
      options={
        tagsQuery.data?.tags.map((t) => ({
          label: t.name,
          value: t.id,
        })) ?? []
      }
      value={value}
      onChange={(nextSelected: Option[]) => {
        onChange(nextSelected);
      }}
      labelledBy="Select"
      hasSelectAll
    />
  );
}
