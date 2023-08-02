import { Box } from "@chakra-ui/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export function PageLoadingIndicator() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleStart = (url: string) => {
      setLoading(true);
    };
    const handleComplete = (url: string) => {
      setLoading(false);
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router]);

  return (
    <Box
      position="fixed"
      bottom="4px"
      right="4px"
      pointerEvents="none"
      userSelect="none"
    >
      {loading && (
        <Box>
          <Image
            src="/2bttns-square-only-final.gif"
            alt="loading..."
            width={64}
            height={64}
          />
        </Box>
      )}
    </Box>
  );
}
