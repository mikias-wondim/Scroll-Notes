"use server";

import { getUser } from "@/auth/server";
import { prisma } from "@/db/prisma";
import { handleError } from "@/lib/utils";
import openai from "@/lib/openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import type { APIError } from "openai/error";

export const createNoteAction = async (noteId: string) => {
  try {
    const user = await getUser();
    if (!user) throw new Error("You must be logged in to create a note");

    await prisma.note.create({
      data: {
        id: noteId,
        authorId: user.id,
        text: "",
      },
    });

    return { errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

export const updateNoteAction = async (noteId: string, text: string) => {
  try {
    const user = await getUser();
    if (!user) throw new Error("You must be logged in to update a note");

    await prisma.note.update({
      where: { id: noteId },
      data: { text },
    });

    return { errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

export const deleteNoteAction = async (noteId: string) => {
  try {
    const user = await getUser();
    if (!user) throw new Error("You must be logged in to delete a note");

    await prisma.note.delete({
      where: { id: noteId, authorId: user.id },
    });

    return { errorMessage: null };
  } catch (error) {
    return { errorMessage: handleError(error) };
  }
};

export const askAIAboutNotesAction = async (
  noteId: string,
  question: string,
  includeHistory: boolean = true,
) => {
  const user = await getUser();
  if (!user) throw new Error("You must be logged in to ask AI questions");

  try {
    // Get the specific note
    const note = await prisma.note.findUnique({
      where: { id: noteId, authorId: user.id },
      select: { text: true, createdAt: true, updatedAt: true },
    });

    if (!note) {
      return "Note not found";
    }

    // Get conversation history for this note
    const conversationHistory = includeHistory
      ? await prisma.aIConversation.findMany({
          where: { noteId },
          orderBy: { createdAt: "asc" },
          select: { question: true, response: true },
        })
      : [];

    // Format the note
    const formattedNote = `
      Text: ${note.text}
      Created at: ${note.createdAt}
      Last updated: ${note.updatedAt}
    `.trim();

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `
            You are a helpful assistant that answers questions about the user's note.
            Assume all questions are related to the specific note provided below.
            Make sure that your answers are not too verbose and you speak succinctly.
            Your responses MUST be formatted in clean, valid HTML with proper structure.
            Use tags like <p>, <strong>, <em>, <ul>, <ol>, <li>, <h1> to <h6>, and <br> when appropriate.
            Do NOT wrap the entire response in a single <p> tag unless it's a single paragraph.
            Avoid inline styles, JavaScript, or custom attributes.

            Rendered like this in JSX:
            <p dangerouslySetInnerHTML={{ __html: YOUR_RESPONSE }} />

            Here is the user's note:
            ${formattedNote}
            `,
      },
    ];

    // Add conversation history
    for (const message of conversationHistory) {
      messages.push({ role: "user", content: message.question });
      messages.push({ role: "assistant", content: message.response });
    }

    // Add current question
    messages.push({ role: "user", content: question });

    // Set up abort controller for timeout
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 15000); // 15 second timeout

    try {
      const completion = await openai.chat.completions.create(
        {
          model: "gpt-4o",
          messages,
          temperature: 1,
          max_tokens: 1000,
          top_p: 1,
        },
        { signal: abortController.signal },
      );

      clearTimeout(timeoutId);

      const response =
        completion.choices[0].message.content || "A problem has occurred";

      // Save the conversation entry
      await prisma.aIConversation.create({
        data: {
          noteId,
          question,
          response,
        },
      });

      return response;
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      console.error("OpenAI API error:", error);

      if (
        typeof error === "object" &&
        error !== null &&
        (("name" in error && error.name === "AbortError") ||
          ("code" in error && error.code === "ETIMEDOUT"))
      ) {
        return "The AI response took too long. Please try again with a simpler question.";
      }

      return "An error occurred while processing your request. Please try again later.";
    }
  } catch (error) {
    console.error("Notes processing error:", error);
    return "An error occurred while processing your notes. Please try again later.";
  }
};

export const getConversationHistoryAction = async (noteId: string) => {
  try {
    const user = await getUser();
    if (!user)
      throw new Error("You must be logged in to access conversation history");

    if (!noteId) {
      return { errorMessage: "Note ID is required", conversations: [] };
    }

    // Verify user has access to this note
    const note = await prisma.note.findUnique({
      where: { id: noteId, authorId: user.id },
    });

    if (!note) {
      return { errorMessage: "Note not found", conversations: [] };
    }

    const conversations = await prisma.aIConversation.findMany({
      where: { noteId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        question: true,
        response: true,
        createdAt: true,
      },
    });

    return { errorMessage: null, conversations };
  } catch (error) {
    return { errorMessage: handleError(error), conversations: [] };
  }
};

export const clearConversationHistoryAction = async (noteId: string) => {
  try {
    const user = await getUser();
    if (!user)
      throw new Error("You must be logged in to clear conversation history");

    if (!noteId) {
      return { errorMessage: "Note ID is required" };
    }

    // Verify user has access to this note
    const note = await prisma.note.findUnique({
      where: { id: noteId, authorId: user.id },
    });

    if (!note) {
      return { errorMessage: "Note not found" };
    }

    await prisma.aIConversation.deleteMany({
      where: { noteId },
    });

    return { errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

// Helper function for prefetching conversations with a note
export async function getAIConversationsForNote(noteId: string) {
  try {
    const user = await getUser();
    if (!user || !noteId) {
      return { conversations: [] };
    }

    // Verify user has access to this note
    const note = await prisma.note.findUnique({
      where: { id: noteId, authorId: user.id },
    });

    if (!note) {
      return { conversations: [] };
    }

    const conversations = await prisma.aIConversation.findMany({
      where: { noteId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        question: true,
        response: true,
        createdAt: true,
      },
    });

    return { conversations };
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return { conversations: [] };
  }
}
