// Bring the @testing-library/jest-dom matcher types into the Vitest `Assertion`
// interface for every test file in this project. The runtime matchers are
// registered in ./setup.tsx via `import "@testing-library/jest-dom/vitest"`;
// this declaration file makes the same module's type augmentation visible to
// the TypeScript program so `toBeInTheDocument`, `toBeDisabled`, etc. type-check.
import "@testing-library/jest-dom/vitest";
