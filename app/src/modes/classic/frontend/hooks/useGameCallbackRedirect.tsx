import { useEffect, useRef, useState } from "react";

export type UseGameCallbackRedirectProps = {
  callbackUrl?: string | null;
  delayMs?: number;
};
export function useGameCallbackRedirect(props: UseGameCallbackRedirectProps) {
  const { callbackUrl, delayMs = 3000 } = props;
  const [isRedirecting, setRedirecting] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const redirectToCallbackUrl = () => {
    if (typeof window === "undefined") return;
    if (!callbackUrl) return;

    setRedirecting(true);

    timeoutRef.current = setTimeout(() => {
      window.location.href = callbackUrl;
    }, delayMs);
  };

  useEffect(() => {
    // Clean up the timeout ref if the component unmounts; otherwise the redirect may happen after the component unmounts (e.g. clicking a button that redirects to another page)
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isRedirecting,
    setRedirecting,
    redirectToCallbackUrl,
  };
}
