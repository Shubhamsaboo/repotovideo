import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL || "http://localhost:8000";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const res = await fetch(`${API_URL}/api/download/${jobId}`);

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const blob = await res.blob();
    return new NextResponse(blob, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="viral-video.mp4"`,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
