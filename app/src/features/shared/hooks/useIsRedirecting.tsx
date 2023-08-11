import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function useIsRedirecting() {
  const router = useRouter();

  const [isRedirecting, setRedirecting] = useState(false);
  useEffect(() => {
    const onStart = () => {
      setRedirecting(true);
    };
    const onEnd = () => {
      setRedirecting(false);
    };

    router.events.on("routeChangeStart", onStart);
    router.events.on("routeChangeComplete", onEnd);
    router.events.on("routeChangeError", onEnd);
    return () => {
      router.events.off("routeChangeStart", onStart);
      router.events.off("routeChangeComplete", onEnd);
      router.events.off("routeChangeError", onEnd);
    };
  }, [router]);

  return isRedirecting;
}
