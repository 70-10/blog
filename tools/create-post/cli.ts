import { main } from "./index";

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
