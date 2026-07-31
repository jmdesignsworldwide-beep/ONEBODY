import type { SVGProps } from "react";

/* Íconos oficiales de marca (SVG inline). Presentacionales, sin estado. */

export function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden {...props}>
      <path
        fill="#25D366"
        d="M.06 24l1.68-6.15A11.87 11.87 0 0 1 .13 11.9C.13 5.33 5.48 0 12.05 0a11.82 11.82 0 0 1 8.41 3.49 11.82 11.82 0 0 1 3.48 8.41c0 6.57-5.35 11.91-11.92 11.91a11.9 11.9 0 0 1-5.7-1.45L.06 24Z"
      />
      <path
        fill="#fff"
        d="M18.4 14.24c-.28-.14-1.67-.82-1.93-.92-.26-.09-.45-.14-.63.14-.19.28-.72.92-.89 1.11-.16.19-.33.21-.61.07-.28-.14-1.19-.44-2.27-1.4-.84-.75-1.4-1.67-1.57-1.95-.16-.28-.02-.43.12-.57.13-.13.28-.33.42-.5.14-.16.19-.28.28-.47.09-.19.05-.35-.02-.49-.07-.14-.63-1.52-.86-2.08-.23-.55-.46-.48-.63-.48l-.54-.01c-.19 0-.49.07-.75.35-.26.28-.98.96-.98 2.34 0 1.38 1.01 2.72 1.15 2.9.14.19 1.98 3.03 4.8 4.25.67.29 1.19.46 1.6.59.67.21 1.28.18 1.76.11.54-.08 1.67-.68 1.9-1.34.24-.66.24-1.22.16-1.34-.07-.12-.26-.19-.54-.33Z"
      />
    </svg>
  );
}

export function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden {...props}>
      <path
        fill="#1877F2"
        d="M24 12c0-6.63-5.37-12-12-12S0 5.37 0 12c0 5.99 4.39 10.95 10.13 11.85v-8.38H7.08V12h3.05V9.36c0-3.01 1.79-4.67 4.53-4.67 1.31 0 2.68.23 2.68.23v2.95h-1.51c-1.49 0-1.95.92-1.95 1.87V12h3.32l-.53 3.47h-2.79v8.38C19.61 22.95 24 17.99 24 12Z"
      />
    </svg>
  );
}

export function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden {...props}>
      <path
        fill="currentColor"
        d="M18.9 1.5h3.68l-8.04 9.19L24 22.5h-7.41l-5.8-7.58-6.64 7.58H.46l8.6-9.83L0 1.5h7.6l5.24 6.93L18.9 1.5Zm-1.29 18.8h2.04L6.48 3.6H4.29l13.32 16.7Z"
      />
    </svg>
  );
}

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden {...props}>
      <defs>
        <radialGradient id="ig-g" cx="0.3" cy="1" r="1">
          <stop offset="0" stopColor="#FED576" />
          <stop offset="0.25" stopColor="#F47133" />
          <stop offset="0.5" stopColor="#BC3081" />
          <stop offset="1" stopColor="#4C63D2" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="24" height="24" rx="6" fill="url(#ig-g)" />
      <path
        fill="#fff"
        d="M12 7.2A4.8 4.8 0 1 0 16.8 12 4.81 4.81 0 0 0 12 7.2Zm0 7.92A3.12 3.12 0 1 1 15.12 12 3.12 3.12 0 0 1 12 15.12Zm4.98-8.28a1.12 1.12 0 1 1-1.12-1.12 1.12 1.12 0 0 1 1.12 1.12Z"
      />
    </svg>
  );
}

export function EmailIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden {...props}>
      <path
        fill="currentColor"
        d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm9 7.01L4.4 7h15.2L12 12.01ZM4 8.24V17h16V8.24l-8 5.28-8-5.28Z"
      />
    </svg>
  );
}

export function LinkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden {...props}>
      <path
        fill="currentColor"
        d="M10.6 13.4a1 1 0 0 0 1.4 0l3.5-3.5a2 2 0 1 1 2.8 2.8l-1.9 1.9a1 1 0 1 0 1.4 1.4l1.9-1.9a4 4 0 0 0-5.6-5.6l-3.5 3.5a1 1 0 0 0 0 1.4Zm2.8-2.8a1 1 0 0 0-1.4 0l-3.5 3.5a2 2 0 1 1-2.8-2.8l1.9-1.9A1 1 0 0 0 6.2 8L4.3 9.9a4 4 0 0 0 5.6 5.6l3.5-3.5a1 1 0 0 0 0-1.4Z"
      />
    </svg>
  );
}

export function ShareIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden {...props}>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 8a3 3 0 1 0-2.82-4H15a3 3 0 0 0 .18 4l-6.36 3.5M6 15a3 3 0 1 0 0-.02M15.18 20A3 3 0 1 1 18 16a3 3 0 0 1-2.82 4Zm0 0-6.36-3.5"
      />
    </svg>
  );
}

export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden {...props}>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m5 13 4 4L19 7"
      />
    </svg>
  );
}
