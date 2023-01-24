// deno-lint-ignore-file no-explicit-any
/** Removes undefined entries from object */
export const removeUndefinedFromObject = (obj: Record<string, any>) =>
  Object.entries(obj).reduce((acc, curEntry) => {
    const [key, val] = curEntry;
    if (val !== undefined) acc[key] = val;
    return acc;
  }, {} as Record<string, any>);

export const sleep = async (ms: number): Promise<void> =>
  await new Promise((resolve) => setTimeout(resolve, ms));

export const addProtocolIfNotPresent = (host: string): string =>
  !(host.startsWith("https://") || host.startsWith("http://"))
    ? `http://${host}`
    : host;

export const addTrailingSlash = (url: string): string =>
  !url.endsWith("/") ? url + "/" : url;

export const validateUuid4 = (uuid: string): boolean =>
  /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi
    .test(uuid);
