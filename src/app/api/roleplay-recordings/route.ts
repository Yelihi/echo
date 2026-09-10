import { submitRoleplayRecording } from "@/features/recording-storage/services/server/submitRoleplayRecording";

export const runtime = "nodejs";
export async function POST(request: Request): Promise<Response> {
  try {
    return await submitRoleplayRecording(request);
  } catch {
    return Response.json({ error: "Recording request failed" }, { status: 500 });
  }
}
