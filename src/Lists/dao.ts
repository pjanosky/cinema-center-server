import { SortOrder } from "mongoose";
import model from "./model";
import { List, ListDocument, NewList } from "./types";

function parseList(document: ListDocument): List {
  return {
    _id: document._id.toString(),
    date: document.date.toISOString(),
    userId: document.userId.toString(),
    title: document.title,
    description: document.description,
    entries: document.entries,
  };
}

export async function getListById(listId: string): Promise<List | undefined> {
  try {
    const document = await model.findById(listId);
    return document ? parseList(document) : undefined;
  } catch {
    return undefined;
  }
}

export async function createList(list: NewList): Promise<List | undefined> {
  try {
    const document = await model.create(list);
    return parseList(document);
  } catch {
    return undefined;
  }
}

export async function updateList(list: List): Promise<boolean> {
  try {
    const result = await model.updateOne({ _id: list._id }, { $set: list });
    return result.matchedCount === 1;
  } catch {
    return false;
  }
}

export async function deleteList(listId: string): Promise<boolean> {
  try {
    const result = await model.deleteOne({ _id: listId });
    return result.deletedCount === 1;
  } catch {
    return false;
  }
}

export async function deleteListsByUserId(userId: string): Promise<boolean> {
  try {
    const result = await model.deleteMany({ userId });
    return result.acknowledged;
  } catch {
    return false;
  }
}

export async function findListsByQuery({
  userId,
  movieId,
  sort = "date",
  order = "desc",
  limit = 1000,
  query,
}: {
  userId: string | undefined;
  movieId: string | undefined;
  sort: string | undefined;
  order: SortOrder | undefined;
  limit: number | undefined;
  query: string | undefined;
}): Promise<List[]> {
  try {
    const documents = await model
      .find({
        $and: [
          {},
          ...(userId ? [{ userId: userId }] : []),
          ...(movieId ? [{ "entries.movieId": movieId }] : []),
          ...(query ? [{ title: { $regex: query, $options: "i" } }] : []),
        ],
      })
      .sort([[sort, order]])
      .limit(limit);
    const d = documents.map(parseList);
    return d;
  } catch (error) {
    console.log(error);
    return [];
  }
}
