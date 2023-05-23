import { useState } from "react";

export type UseGameCallbackRedirectProps = {
  callbackUrl?: string | null;
  delayMs?: number;
};
export function useGameCallbackRedirect(props: UseGameCallbackRedirectProps) {
  const { callbackUrl, delayMs = 5000 } = props;
  const [isRedirecting, setRedirecting] = useState(false);

  const redirectToCallbackUrl = () => {
    if (typeof window === "undefined") return;
    if (!callbackUrl) return;

    setRedirecting(true);
    setTimeout(() => {
      window.location.href = callbackUrl;
    }, delayMs);
  };

  return {
    isRedirecting,
    setRedirecting,
    redirectToCallbackUrl,
  };
}
