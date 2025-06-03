// import * as fs from "fs";
import * as pdf from "pdf-parse";

export async function loadPdfText(fileBuffer: Buffer): Promise<string> {
    // const buffer = fs.readFileSync(filePath);
    const data = await pdf(fileBuffer);
    return data.text;
}
