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
  newQuestions: string[],
  responses: string[],
) => {
  const user = await getUser();
  if (!user) throw new Error("You must be logged in to ask AI questions");

  try {
    // Find only the most recent notes to limit data transfer
    const notes = await prisma.note.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: "desc" },
      select: { text: true, createdAt: true, updatedAt: true },
      take: 10, // Limit to 10 most recent notes
    });

    if (notes.length === 0) {
      return "You don't have any notes yet.";
    }

    type NoteData = {
      text: string;
      createdAt: Date;
      updatedAt: Date;
    };

    // Truncate note text if it's too long
    const formattedNotes = notes
      .map((note: NoteData) => {
        // Limit text length to prevent large payloads
        const truncatedText =
          note.text.length > 1000
            ? note.text.substring(0, 1000) + "..."
            : note.text;

        return `
        Text: ${truncatedText}
        Created at: ${note.createdAt}
        Last updated: ${note.updatedAt}
        `.trim();
      })
      .join("\n");

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `
            You are a helpful assistant that answers questions about a user's notes.
            Assume all questions are related to the user's notes.
            Make sure that your answers are not too verbose and you speak succinctly.
            Your responses MUST be formatted in clean, valid HTML with proper structure.
            Use tags like <p>, <strong>, <em>, <ul>, <ol>, <li>, <h1> to <h6>, and <br> when appropriate.
            Do NOT wrap the entire response in a single <p> tag unless it's a single paragraph.
            Avoid inline styles, JavaScript, or custom attributes.

            Rendered like this in JSX:
            <p dangerouslySetInnerHTML={{ __html: YOUR_RESPONSE }} />

            Here are the user's notes:
            ${formattedNotes}
            `,
      },
    ];

    // Include only the most recent conversation history to keep payload size down
    const maxConversationTurns = 3;
    const startIdx = Math.max(0, newQuestions.length - maxConversationTurns);

    for (let i = startIdx; i < newQuestions.length; i++) {
      messages.push({ role: "user", content: newQuestions[i] });
      if (responses.length > i) {
        messages.push({ role: "assistant", content: responses[i] });
      }
    }

    // Set up abort controller for timeout
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 15000); // 15 second timeout

    try {
      const completion = await openai.chat.completions.create(
        {
          model: "gpt-4o",
          messages,
          temperature: 1,
          max_tokens: 1000, // Reduce from 4096 to prevent timeouts
          top_p: 1,
        },
        { signal: abortController.signal },
      );

      clearTimeout(timeoutId);
      return completion.choices[0].message.content || "A problem has occurred";
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
