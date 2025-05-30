import * as fs from 'fs';
import * as pdf from 'pdf-parse';

export async function loadPdfText(filePath: string): Promise<string> {
    const buffer = fs.readFileSync(filePath);
    const data = await pdf(buffer);
    return data.text;
}
