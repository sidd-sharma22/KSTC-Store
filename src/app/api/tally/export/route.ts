import { NextRequest, NextResponse } from "next/server";
import { exportTallyVouchersAction } from "@/app/actions/tally";

export async function GET(request: NextRequest) {
  try {
    const res = await exportTallyVouchersAction();
    if (!res.success || !res.xml) {
      return NextResponse.json({ error: res.error || "No vouchers available" }, { status: 400 });
    }

    const filename = `kstc-tally-sales-${new Date().toISOString().slice(0, 10)}.xml`;

    return new NextResponse(res.xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: unknown) {
    console.error("Tally XML export route error:", error);
    return NextResponse.json({ error: "Failed to export Tally XML" }, { status: 500 });
  }
}
