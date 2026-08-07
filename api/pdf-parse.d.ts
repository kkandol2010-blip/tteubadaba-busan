declare module "pdf-parse/lib/pdf-parse.js" {
  type PdfResult = { text: string };
  export default function parsePdf(data: Buffer): Promise<PdfResult>;
}
