import { FetchError, MeiliSearchErrorInfo } from "../types.ts";

export class MeiliSearchTimeOutError extends Error {
  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, MeiliSearchTimeOutError.prototype);

    this.name = "MeiliSearchTimeOutError";

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MeiliSearchTimeOutError);
    }
  }
}

export const MeiliSearchApiError = class extends Error {
  httpStatus: number;
  code: string;
  link: string;
  type: string;
  stack?: string;

  constructor(error: MeiliSearchErrorInfo, status: number) {
    super(error.message);

    Object.setPrototypeOf(this, MeiliSearchApiError.prototype);

    this.name = "MeiliSearchApiError";

    this.code = error.code;
    this.type = error.type;
    this.link = error.link;
    this.message = error.message;
    this.httpStatus = status;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MeiliSearchApiError);
    }
  }
};

export class MeiliSearchCommunicationError extends Error {
  statusCode?: number;
  errno?: string;
  code?: string;
  stack?: string;

  constructor(
    message: string,
    body: Response | FetchError,
    url?: string,
    stack?: string,
  ) {
    super(message);

    Object.setPrototypeOf(this, MeiliSearchCommunicationError.prototype);

    this.name = "MeiliSearchCommunicationError";

    if (body instanceof Response) {
      this.message = body.statusText;
      this.statusCode = body.status;
    }
    if (body instanceof Error) {
      this.errno = body.errno;
      this.code = body.code;
    }
    if (stack) {
      this.stack = stack;
      this.stack = this.stack?.replace(/(TypeError|FetchError)/, this.name);
      this.stack = this.stack?.replace(
        "Failed to fetch",
        `request to ${url} failed, reason: connect ECONNREFUSED`,
      );
      this.stack = this.stack?.replace("Not Found", `Not Found: ${url}`);
    } else {
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, MeiliSearchCommunicationError);
      }
    }
  }
}

export async function httpResponseErrorHandler(
  response: Response,
): Promise<Response> {
  if (!response.ok) {
    let responseBody;
    try {
      // If it is not possible to parse the return body it means there is none
      // In which case it is a communication error with the Meilisearch instance
      responseBody = await response.json();
      // deno-lint-ignore no-explicit-any
    } catch (_e: any) {
      // Not sure on how to test this part of the code.
      throw new MeiliSearchCommunicationError(
        response.statusText,
        response,
        response.url,
      );
    }
    // If the body is parsable, then it means Meilisearch returned a body with
    // information on the error.
    throw new MeiliSearchApiError(responseBody, response.status);
  }

  return response;
}

export class MeiliSearchError extends Error {
  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, MeiliSearchError.prototype);

    this.name = "MeiliSearchError";

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MeiliSearchError);
    }
  }
}

export function httpErrorHandler(
  response: FetchError,
  stack?: string,
  url?: string,
): Promise<void> {
  if (response.name !== "MeiliSearchApiError") {
    throw new MeiliSearchCommunicationError(
      response.message,
      response,
      url,
      stack,
    );
  }
  throw response;
}
