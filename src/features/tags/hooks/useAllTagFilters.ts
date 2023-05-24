import { useMemo, useState } from "react";
import { api } from "../../../utils/api";
import { TagFilter } from "../containers/TagFilterToggles";

export const UNTAGGED_ID = "Untagged";

export default function useAllTagFilters() {
  const [tagFilter, setTagFilter] = useState<TagFilter>({
    Untagged: {
      tagName: UNTAGGED_ID,
      on: true,
      colorScheme: "blackAlpha",
    },
  });

  const tagsCountQuery = api.tags.getCount.useQuery();
  const tagsQuery = api.tags.getAll.useQuery(
    {
      take: tagsCountQuery.data?.count ?? 0,
      sortField: "name",
      sortOrder: "asc",
    },
    {
      refetchOnWindowFocus: false,
      enabled:
        !tagsCountQuery.isLoading &&
        tagsCountQuery.data?.count !== undefined &&
        tagsCountQuery.data?.count > 0,
      keepPreviousData: true,
      onSuccess: (data) => {
        const fetchedTagFilters: TagFilter = {};
        data.tags.forEach((tag) => {
          fetchedTagFilters[tag.id] = {
            tagName: tag.name,
            on: true,
            colorScheme: "green",
          };
        });

        setTagFilter((prev) => ({
          ...prev,
          ...fetchedTagFilters,
        }));
      },
    }
  );

  const includeTags = useMemo(() => {
    return Object.keys(tagFilter)
      .filter((tagId) => {
        if (tagId === UNTAGGED_ID) {
          return false;
        }
        return tagFilter[tagId]!.on;
      })
      .map((tagId) => tagId);
  }, [tagFilter]);

  const excludeTags = useMemo(() => {
    const allOff = Object.keys(tagFilter).every((tagId) => {
      return !tagFilter[tagId]!.on;
    });

    if (allOff) {
      return Object.keys(tagFilter)
        .filter((tagId) => {
          if (tagId === UNTAGGED_ID) {
            return false;
          }
          return true;
        })
        .map((tagId) => tagId);
    }

    return [];
  }, [tagFilter]);

  const includeUntagged = useMemo(() => {
    return tagFilter.Untagged!.on;
  }, [tagFilter]);

  return {
    state: {
      tagFilter,
      setTagFilter,
    },
    results: {
      includeTags,
      excludeTags,
      includeUntagged,
    },
    tagsQuery,
  };
}
