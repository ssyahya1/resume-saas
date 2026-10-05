import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import AppError from "../utils/appError.js";

export const parseResume = async (file) => {
  if (!file) {
    throw new AppError("Resume file is required", 400);
  }

  const { mimetype, buffer } = file;

  if (mimetype === "application/pdf") {
    const parser = new PDFParse({
      data: buffer,
    });

    const result = await parser.getText();

    await parser.destroy();

    return result.text;
  }

  if (
    mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({
      buffer,
    });

    return result.value;
  }

  throw new AppError("Unsupported resume file type", 400);
};