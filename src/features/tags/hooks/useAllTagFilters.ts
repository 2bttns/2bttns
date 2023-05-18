import { useMemo, useRef, useState } from "react";
import { api } from "../../../utils/api";
import { TagFilter } from "../containers/TagFilterToggles";

export default function useAllTagFilters() {
  const [tagFilter, setTagFilter] = useState<TagFilter>({
    Untagged: {
      tagName: "Untagged",
      on: true,
      colorScheme: "blackAlpha",
    },
  });

  const didFetchRef = useRef(false);
  const tagsQuery = api.tags.getAll.useQuery(
    {},
    {
      refetchOnWindowFocus: false,
      enabled: !didFetchRef.current,

      keepPreviousData: true,
      onSuccess: (data) => {
        if (didFetchRef.current) {
          return;
        }

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
        didFetchRef.current = true;
      },
    }
  );

  const includeTags = useMemo(() => {
    return Object.keys(tagFilter)
      .filter((tagId) => {
        if (tagId === "Untagged") {
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
          if (tagId === "Untagged") {
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
