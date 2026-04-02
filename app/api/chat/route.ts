import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { Message } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: Message[] } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required." },
        { status: 400 }
      );
    }

    // env var takes priority; client-supplied key is the fallback for local dev
    const apiKey =
      process.env.OPENAI_API_KEY?.trim() ||
      req.headers.get("x-openai-api-key")?.trim();

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "No OpenAI API key configured. Please add your key using the key icon in the header.",
          code: "missing_api_key",
        },
        { status: 401 }
      );
    }

    const openai = new OpenAI({ apiKey });

    const openaiMessages = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful, knowledgeable, and concise AI assistant. Provide clear, accurate, and well-structured responses. Use markdown formatting where appropriate.",
        },
        ...openaiMessages,
      ],
      max_tokens: 2048,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content;

    if (!reply) {
      return NextResponse.json(
        { error: "No response received from the AI model." },
        { status: 500 }
      );
    }

    return NextResponse.json({ reply });
  } catch (error: unknown) {
    console.error("Chat API error:", error);

    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      "message" in error
    ) {
      const apiError = error as { status: number; message: string };
      if (apiError.status === 401) {
        return NextResponse.json(
          {
            error:
              "Invalid OpenAI API key. Please update your key using the key icon in the header.",
            code: "invalid_api_key",
          },
          { status: 401 }
        );
      }
      if (apiError.status === 429) {
        return NextResponse.json(
          {
            error:
              "Rate limit exceeded. Please wait a moment before sending another request.",
          },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: apiError.message || "An error occurred with the AI service." },
        { status: apiError.status || 500 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
