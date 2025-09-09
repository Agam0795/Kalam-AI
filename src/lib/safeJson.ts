/**
 * Safely parse a fetch Response as JSON. If the body isn't JSON, returns a structured
 * object with raw snippet and error message instead of throwing.
 */
export async function safeJson(resp: Response) {
  const contentType = resp.headers.get('content-type') || '';
  const status = resp.status;
  if (!contentType.includes('application/json')) {
    const raw = await resp.text();
    return {
      ok: resp.ok,
      status,
      contentType,
      error: 'non-json-response',
      rawSnippet: raw.slice(0, 500)
    } as const;
  }
  try {
    const data = await resp.json();
    return { ok: resp.ok, status, contentType, data } as const;
  } catch (e) {
    const raw = await resp.text().catch(() => '');
    return {
      ok: resp.ok,
      status,
      contentType,
      error: 'json-parse-failed',
      rawSnippet: raw.slice(0, 500),
      message: e instanceof Error ? e.message : 'Unknown parse error'
    } as const;
  }
}

export type SafeJsonResult = Awaited<ReturnType<typeof safeJson>>;
