// FIX: The reference to "vite/client" was causing an error because the type definition file could not be found.
// It is commented out to resolve the error. A declaration for `process.env` is added to allow TypeScript to compile the code using `process.env.API_KEY`.
// /// <reference types="vite/client" />

declare var process: {
  env: {
    API_KEY?: string;
  };
};
