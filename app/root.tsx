import { Links, Meta, Outlet, Scripts, ScrollRestoration, useRouteError } from '@remix-run/react';
import type { LinksFunction } from '@remix-run/node';

import './tailwind.css';
import { ErrorComponent } from '@/components/building-blocks/error-component/error-component';

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  // eslint-disable-next-line
  const error: any = useRouteError();
  if (import.meta.env.VITE_PROD) {
    return <ErrorComponent errorMessage="Something went wrong, please try to refresh the page." />;
  }

  return <pre>{error?.stack}</pre>;
}

export default function App() {
  return <Outlet />;
}
