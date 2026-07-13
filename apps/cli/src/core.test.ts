import { describe, expect, it } from "vitest";

import {
  CliError,
  parseArgs,
  parseInput,
  validateBaseUrl,
  validateFilePath,
  validateHashValue,
} from "./core";

/** Assert that `fn` throws a CliError carrying the expected `code`. */
const expectCliError = (fn: () => unknown, code: string): void => {
  let thrown: unknown;
  try {
    fn();
  } catch (error) {
    thrown = error;
  }
  expect(thrown).toBeInstanceOf(CliError);
  if (thrown instanceof CliError) {
    expect(thrown.code).toBe(code);
  }
};

/** Build a `<scheme>://x.com` URL without a clear-text protocol literal. */
const urlWithScheme = (scheme: string): string => `${scheme}://x.com`;

// A null byte (U+0000) stands in for the control-character class the guards
// reject. Built via String.fromCodePoint so no raw control char sits in source.
const CONTROL_CHAR = String.fromCodePoint(0);

describe("validateFilePath", () => {
  it("accepts a normal path", () => {
    expect(() => {
      validateFilePath("designs/home.json");
    }).not.toThrow();
  });

  it("throws INVALID_ARGUMENT on a control character", () => {
    expectCliError(() => {
      validateFilePath(`a${CONTROL_CHAR}b`);
    }, "INVALID_ARGUMENT");
  });

  it("throws INVALID_ARGUMENT on %2e", () => {
    expectCliError(() => {
      validateFilePath("foo/%2e%2e/bar");
    }, "INVALID_ARGUMENT");
  });

  it("throws INVALID_ARGUMENT on %2f", () => {
    expectCliError(() => {
      validateFilePath("foo%2fbar");
    }, "INVALID_ARGUMENT");
  });

  it("throws INVALID_ARGUMENT on %5c", () => {
    expectCliError(() => {
      validateFilePath("foo%5cbar");
    }, "INVALID_ARGUMENT");
  });

  it("does NOT throw on plain .. traversal (left to the OS by design)", () => {
    expect(() => {
      validateFilePath("../../etc/passwd");
    }).not.toThrow();
  });
});

describe("validateBaseUrl", () => {
  it("accepts https URLs", () => {
    expect(() => {
      validateBaseUrl("https://x.com");
    }).not.toThrow();
  });

  it("accepts http URLs", () => {
    expect(() => {
      validateBaseUrl(urlWithScheme("http"));
    }).not.toThrow();
  });

  it("throws INVALID_ARGUMENT on a non-URL", () => {
    expectCliError(() => {
      validateBaseUrl("not a url");
    }, "INVALID_ARGUMENT");
  });

  it("throws INVALID_ARGUMENT on a non-http(s) protocol", () => {
    expectCliError(() => {
      validateBaseUrl(urlWithScheme("ftp"));
    }, "INVALID_ARGUMENT");
  });

  it("throws INVALID_ARGUMENT on a URL with a query string", () => {
    expectCliError(() => {
      validateBaseUrl("https://x.com?a=1");
    }, "INVALID_ARGUMENT");
  });

  it("throws INVALID_ARGUMENT on a URL with a fragment", () => {
    expectCliError(() => {
      validateBaseUrl("https://x.com#frag");
    }, "INVALID_ARGUMENT");
  });
});

describe("validateHashValue", () => {
  it("accepts a bare fragment", () => {
    expect(() => {
      validateHashValue("abc123");
    }).not.toThrow();
  });

  it("accepts a full editor URL", () => {
    expect(() => {
      validateHashValue("https://wiretext.app/#abc");
    }).not.toThrow();
  });

  it("throws INVALID_ARGUMENT on control characters", () => {
    expectCliError(() => {
      validateHashValue(`a${CONTROL_CHAR}bc`);
    }, "INVALID_ARGUMENT");
  });

  it("throws INVALID_ARGUMENT on an embedded query after the fragment", () => {
    expectCliError(() => {
      validateHashValue("https://wiretext.app/#abc?evil=1");
    }, "INVALID_ARGUMENT");
  });
});

describe("parseArgs", () => {
  it("sets boolean flag fields from documented flags", () => {
    const parsed = parseArgs([
      "share",
      "--json",
      "--open",
      "--copy",
      "--dry-run",
    ]);
    expect(parsed.cmd).toBe("share");
    expect(parsed.jsonFlag).toBe(true);
    expect(parsed.shouldOpen).toBe(true);
    expect(parsed.shouldCopy).toBe(true);
    expect(parsed.dryRun).toBe(true);
  });

  it("supports the -o and -c aliases", () => {
    const parsed = parseArgs(["create", "-o", "-c"]);
    expect(parsed.shouldOpen).toBe(true);
    expect(parsed.shouldCopy).toBe(true);
  });

  it("captures --base-url and --hash values", () => {
    const parsed = parseArgs([
      "share",
      "--base-url",
      "https://example.com",
      "--hash",
      "abc",
    ]);
    expect(parsed.baseUrl).toBe("https://example.com");
    expect(parsed.hashValue).toBe("abc");
  });

  it("treats --output json as JSON mode", () => {
    const parsed = parseArgs(["render", "--output", "json"]);
    expect(parsed.jsonFlag).toBe(true);
  });

  it("resolves positional command and file path", () => {
    const parsed = parseArgs(["render", "design.json"]);
    expect(parsed.cmd).toBe("render");
    expect(parsed.filePath).toBe("design.json");
  });

  it("treats a bare - as the stdin file path, not an error", () => {
    const parsed = parseArgs(["render", "-"]);
    expect(parsed.cmd).toBe("render");
    expect(parsed.filePath).toBe("-");
  });

  it("throws INVALID_ARGUMENT on an unknown --flag", () => {
    expectCliError(
      () => parseArgs(["--foo", "share", "file.json"]),
      "INVALID_ARGUMENT"
    );
  });

  it("throws INVALID_ARGUMENT when --base-url has no value", () => {
    expectCliError(
      () => parseArgs(["share", "--base-url"]),
      "INVALID_ARGUMENT"
    );
  });

  it("throws INVALID_ARGUMENT when --hash has no value", () => {
    expectCliError(() => parseArgs(["share", "--hash"]), "INVALID_ARGUMENT");
  });
});

describe("parseInput", () => {
  const validObject = { height: 3, type: "box", width: 10 };

  it("parses a valid JSON array", () => {
    const result = parseInput(JSON.stringify([validObject]));
    expect(result.objects).toHaveLength(1);
  });

  it('parses a { "objects": [...] } document', () => {
    const result = parseInput(JSON.stringify({ objects: [validObject] }));
    expect(result.objects).toHaveLength(1);
  });

  it("throws INVALID_INPUT on invalid JSON", () => {
    expectCliError(() => parseInput("{ not json"), "INVALID_INPUT");
  });

  it("throws INVALID_INPUT on a non-array/non-object value", () => {
    expectCliError(() => parseInput("42"), "INVALID_INPUT");
  });

  it("throws INVALID_INPUT on a schema-invalid object", () => {
    expectCliError(
      () => parseInput(JSON.stringify([{ type: "not-a-real-type" }])),
      "INVALID_INPUT"
    );
  });
});
