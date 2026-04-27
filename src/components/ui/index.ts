/**
 * Hollow UI primitives — shared across panels.
 *
 * Each primitive is tightly scoped and theme-aware. No domain logic, no store
 * access. If you need a new primitive, add it here and export it through this
 * barrel so consumers don't deep-import.
 */

export { Section } from "./Section";
export { Row } from "./Row";
export { Toggle } from "./Toggle";
export { Stepper } from "./Stepper";
export { SegmentedToggle } from "./SegmentedToggle";
export { PanelHeader } from "./PanelHeader";
