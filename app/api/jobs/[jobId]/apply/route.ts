import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

// Maximum CV size: 5 MB.
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed file extensions and MIME types.
const ALLOWED_FILES = {
  ".pdf": ["application/pdf"],
  ".doc": ["application/msword"],
  ".docx": [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
} as const;

// Check the actual file signature (magic bytes).
function hasValidSignature(
  extension: string,
  bytes: Uint8Array
): boolean {
  // PDF files begin with %PDF-
  if (extension === ".pdf") {
    return Buffer.from(bytes.subarray(0, 5)).toString() === "%PDF-";
  }

  // Legacy DOC files use the OLE Compound File signature.
  if (extension === ".doc") {
    const signature = [
      0xd0, 0xcf, 0x11, 0xe0,
      0xa1, 0xb1, 0x1a, 0xe1,
    ];

    return signature.every((byte, index) => bytes[index] === byte);
  }

  // DOCX files are ZIP-based Office documents.
  if (extension === ".docx") {
    return (
      bytes.length >= 4 &&
      bytes[0] === 0x50 &&
      bytes[1] === 0x4b &&
      [0x03, 0x05, 0x07].includes(bytes[2]) &&
      [0x04, 0x06, 0x08].includes(bytes[3])
    );
  }

  return false;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    // 1. Authenticate the user.
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must sign in before applying for a job." },
        { status: 401 }
      );
    }

    // 2. Retrieve the job ID.
    const { jobId } = await params;

    // 3. Read the uploaded file.
    const formData = await request.formData();
    const file = formData.get("cv");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: "Please upload your CV." },
        { status: 400 }
      );
    }

    // 4. Validate the file size.
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Your CV must not exceed 5 MB." },
        { status: 400 }
      );
    }

    // Extract the file extension.
    const fileName = file.name;
    const extension = fileName
      .slice(fileName.lastIndexOf("."))
      .toLowerCase();

    // Check the extension and MIME type.
    const allowedMimeTypes: readonly string[] =
      ALLOWED_FILES[extension as keyof typeof ALLOWED_FILES] ?? [];

    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only PDF, DOC, and DOCX files are allowed." },
        { status: 400 }
      );
    }

    // Convert the uploaded file to binary data.
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // Validate the file signature.
    if (!hasValidSignature(extension, bytes)) {
      return NextResponse.json(
        {
          error:
            "The uploaded file does not appear to be a valid document.",
        },
        { status: 400 }
      );
    }

    // 5. Check that the job exists.
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { id: true },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found." },
        { status: 404 }
      );
    }

    // 6. Check for an existing application.
    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_userId: {
          jobId,
          userId: session.user.id,
        },
      },
      select: { id: true },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "You have already applied for this job." },
        { status: 409 }
      );
    }

    // 7. Save the application and actual CV binary data.
    const application = await prisma.application.create({
      data: {
        jobId,
        userId: session.user.id,
        status: "PENDING",
        cvFile: bytes,
        cvFileName: fileName,
        cvMimeType: file.type,
      },
      select: {
        id: true,
        jobId: true,
        status: true,
        appliedAt: true,
        cvFileName: true,
      },
    });

    return NextResponse.json(
      {
        message: "Application submitted successfully.",
        application,
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle concurrent duplicate submissions.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "You have already applied for this job." },
        { status: 409 }
      );
    }

    console.error("Application submission failed:", error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}