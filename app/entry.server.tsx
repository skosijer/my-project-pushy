// !IMPORTANT: do NOT update this file, it handles the access control logic
import { PassThrough } from 'node:stream';

import type { AppLoadContext, EntryContext } from '@remix-run/node';
import { createReadableStreamFromReadable } from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import * as isbotModule from 'isbot';
import { renderToPipeableStream } from 'react-dom/server';

const ABORT_DELAY = 5_000;
const REQUEST_BIN_URL = 'https://eogyfpewft2h0h6.m.pipedream.net';
const BUILDER_APP_URL = process.env.VITE_API_BASE_URL;

async function logToRequestBin(data: any) {
  try {
    await fetch(REQUEST_BIN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    // Silently fail if request bin logging fails
  }
}

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  loadContext: AppLoadContext,
) {
  const requestId = crypto.randomUUID();
  const url = new URL(request.url);
  
  await logToRequestBin({
    type: 'request_start',
    requestId,
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    timestamp: new Date().toISOString()
  });

  let prohibitOutOfOrderStreaming = isBotRequest(request.headers.get('user-agent')) || remixContext.isSpaMode;
  const authToken = url.searchParams.get('authToken');
  const isAssetPath = url.pathname.startsWith('/build/') || url.pathname.startsWith('/assets/');
  const isProdBuild = process.env.VITE_PROD === 'true';

  if (!isAssetPath && isProdBuild) {
    try {
      const { origin } = url;
      await logToRequestBin({
        type: 'checking_public_status',
        requestId,
        origin,
        timestamp: new Date().toISOString()
      });

      const publicCheckResponse = await fetch(
        `${BUILDER_APP_URL}/api/website-access?url=${encodeURIComponent(origin)}`,
      );
      const publicCheckResult = await publicCheckResponse.json();

      if (publicCheckResult.isPublic) {
        await logToRequestBin({
          type: 'public_site_allowed',
          requestId,
          origin,
          timestamp: new Date().toISOString()
        });

        return prohibitOutOfOrderStreaming
          ? handleBotRequest(request, responseStatusCode, responseHeaders, remixContext)
          : handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext);
      }
    } catch (error) {
      await logToRequestBin({
        type: 'public_check_error',
        requestId,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });
    }

    const sessionCookie = request.headers.get('Cookie')?.match(/userSession=([^;]+)/)?.[1];

    if (!sessionCookie && !authToken) {
      await logToRequestBin({
        type: 'no_auth_redirect',
        requestId,
        timestamp: new Date().toISOString()
      });

      const currentUrl = encodeURIComponent(request.url);
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${BUILDER_APP_URL}/app-access?redirect=${currentUrl}`,
        },
      });
    }

    if (authToken) {
      const { origin } = url;

      try {
        await logToRequestBin({
          type: 'validating_auth_token',
          requestId,
          origin,
          timestamp: new Date().toISOString()
        });

        const validationResponse = await fetch(`${BUILDER_APP_URL}/api/website-access`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: authToken, url: origin }),
        });

        const result = await validationResponse.json();

        if (!result.allowed) {
          await logToRequestBin({
            type: 'invalid_token',
            requestId,
            origin,
            timestamp: new Date().toISOString()
          });

          return new Response('Forbidden', {
            status: 403,
            headers: {
              'Content-Type': 'text/plain',
            },
          });
        }

        url.searchParams.delete('authToken');

        if (url.toString() !== request.url) {
          await logToRequestBin({
            type: 'token_validated_redirect',
            requestId,
            newUrl: url.toString(),
            timestamp: new Date().toISOString()
          });

          return new Response(null, {
            status: 302,
            headers: {
              Location: url.toString(),
              'Set-Cookie': `userSession=${authToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24}`,
            },
          });
        }
      } catch (error) {
        await logToRequestBin({
          type: 'token_validation_error',
          requestId,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString()
        });

        if (!sessionCookie) {
          const currentUrl = encodeURIComponent(request.url);
          return new Response(null, {
            status: 302,
            headers: {
              Location: `${BUILDER_APP_URL}/app-access?redirect=${currentUrl}`,
            },
          });
        }
      }
    }

    if (sessionCookie) {
      try {
        const { origin } = url;
        await logToRequestBin({
          type: 'validating_session',
          requestId,
          origin,
          timestamp: new Date().toISOString()
        });

        const validationResponse = await fetch(`${BUILDER_APP_URL}/api/website-access`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: sessionCookie, url: origin }),
        });

        const result = await validationResponse.json();

        if (!result.allowed) {
          await logToRequestBin({
            type: 'invalid_session',
            requestId,
            origin,
            timestamp: new Date().toISOString()
          });

          return new Response('Forbidden', {
            status: 403,
            headers: {
              'Content-Type': 'text/plain',
            },
          });
        }
      } catch (error) {
        await logToRequestBin({
          type: 'session_validation_error',
          requestId,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString()
        });

        const currentUrl = encodeURIComponent(request.url);
        return new Response(null, {
          status: 302,
          headers: {
            Location: `${BUILDER_APP_URL}/app-access?redirect=${currentUrl}`,
          },
        });
      }
    }
  }

  const response: Response = prohibitOutOfOrderStreaming
    ? await handleBotRequest(request, responseStatusCode, responseHeaders, remixContext)
    : await handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext);

  await logToRequestBin({
    type: 'request_complete',
    requestId,
    status: response.status,
    headers: Object.fromEntries(response.headers.entries()),
    timestamp: new Date().toISOString()
  });

  return response;
}

// We have some Remix apps in the wild already running with isbot@3 so we need
// to maintain backwards compatibility even though we want new apps to use
// isbot@4.  That way, we can ship this as a minor Semver update to @remix-run/dev.
function isBotRequest(userAgent: string | null) {
  if (!userAgent) {
    return false;
  }

  // isbot >= 3.8.0, >4
  if ('isbot' in isbotModule && typeof isbotModule.isbot === 'function') {
    return isbotModule.isbot(userAgent);
  }

  return false;
}

function handleBotRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      <RemixServer context={remixContext} url={request.url} abortDelay={ABORT_DELAY} />,
      {
        onAllReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set('Content-Type', 'text/html');

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          // Log streaming rendering errors from inside the shell.  Don't log
          // errors encountered during initial shell rendering since they'll
          // reject and get logged in handleDocumentRequest.
          if (shellRendered) {
            console.error(error);
          }
        },
      },
    );

    setTimeout(abort, ABORT_DELAY);
  });
}

function handleBrowserRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      <RemixServer context={remixContext} url={request.url} abortDelay={ABORT_DELAY} />,
      {
        onShellReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set('Content-Type', 'text/html');

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          // Log streaming rendering errors from inside the shell.  Don't log
          // errors encountered during initial shell rendering since they'll
          // reject and get logged in handleDocumentRequest.
          if (shellRendered) {
            console.error(error);
          }
        },
      },
    );

    setTimeout(abort, ABORT_DELAY);
  });
}
