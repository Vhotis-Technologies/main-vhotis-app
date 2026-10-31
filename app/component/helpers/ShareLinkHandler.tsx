import useShareLinkHandler from '@/app/hook/main/useShareLinkHandler';

/** Mount once at the app root — no UI. */
export default function ShareLinkHandler() {
  useShareLinkHandler();
  return null;
}
