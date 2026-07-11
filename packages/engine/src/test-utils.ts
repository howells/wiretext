/**
 * Assertion helpers for the engine test suite. Not part of the public API —
 * deliberately not exported from index.ts.
 */
import type {
  ArrowObject,
  BoxObject,
  ComponentObject,
  ConnectorObject,
  LineObject,
  TextObject,
  WireObject,
} from "./types";

const WIRE_OBJECT_LABEL = "wire object";

/** Unwrap a nullable value, failing the test with a clear message if absent. */
export const must = <T>(value: T | null | undefined, label = "value"): T => {
  if (value === null || value === undefined) {
    throw new Error(`Expected ${label} to be present, got ${String(value)}`);
  }
  return value;
};

/** Narrow a wire object to a box, failing the test on mismatch. */
export const mustBeBox = (obj: WireObject | null | undefined): BoxObject => {
  const present = must(obj, WIRE_OBJECT_LABEL);
  if (present.type !== "box") {
    throw new Error(`Expected a box object, got ${present.type}`);
  }
  return present;
};

/** Narrow a wire object to a text object, failing the test on mismatch. */
export const mustBeText = (obj: WireObject | null | undefined): TextObject => {
  const present = must(obj, WIRE_OBJECT_LABEL);
  if (present.type !== "text") {
    throw new Error(`Expected a text object, got ${present.type}`);
  }
  return present;
};

/** Narrow a wire object to a line, failing the test on mismatch. */
export const mustBeLine = (obj: WireObject | null | undefined): LineObject => {
  const present = must(obj, WIRE_OBJECT_LABEL);
  if (present.type !== "line") {
    throw new Error(`Expected a line object, got ${present.type}`);
  }
  return present;
};

/** Narrow a wire object to an arrow, failing the test on mismatch. */
export const mustBeArrow = (
  obj: WireObject | null | undefined
): ArrowObject => {
  const present = must(obj, WIRE_OBJECT_LABEL);
  if (present.type !== "arrow") {
    throw new Error(`Expected an arrow object, got ${present.type}`);
  }
  return present;
};

/** Narrow a wire object to a component, failing the test on mismatch. */
export const mustBeComponent = (
  obj: WireObject | null | undefined
): ComponentObject => {
  const present = must(obj, WIRE_OBJECT_LABEL);
  if (present.type !== "component") {
    throw new Error(`Expected a component object, got ${present.type}`);
  }
  return present;
};

/** Narrow a wire object to a connector, failing the test on mismatch. */
export const mustBeConnector = (
  obj: WireObject | null | undefined
): ConnectorObject => {
  const present = must(obj, WIRE_OBJECT_LABEL);
  if (present.type !== "connector") {
    throw new Error(`Expected a connector object, got ${present.type}`);
  }
  return present;
};
