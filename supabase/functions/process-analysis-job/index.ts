import type {} from "./deno.d.ts";
import { handleProcessAnalysisJob } from "./processor.ts";

Deno.serve(handleProcessAnalysisJob);
