import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
    let data = await request.formData();
    let files = new FormData();

    for (let [key, value] of  Array.from(data.entries())) {
        if (value instanceof File) {
            files.append(key, value);
        }
    }

    let response = await fetch("https://storage.harveycoombs.com/share/upload", {
        method: "POST",
        body: files
    });

    switch (response.status) {
        case 200:
            let json = await response.json();
            return NextResponse.json({ id: json.identifier });
        case 413:
            return NextResponse.json({ error: "Uploaded file(s) too large.", status: 413 });
        default:
            return NextResponse.json({ error: "Unexpected server error.", status: 500 });
    }
}