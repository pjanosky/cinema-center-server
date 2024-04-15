import { Express } from "express";
import { authenticatedEditor } from "../authentication";
import * as dao from "./dao";
import { List, NewList } from "./types";
import { SortOrder } from "mongoose";

export default function ListRoutes(app: Express) {
  app.get("/lists/:listId", async (req, res) => {
    const { listId } = req.params;
    const list = await dao.getListById(listId);
    if (!list) {
      res.sendStatus(404);
      return;
    }
    res.send(list);
  });

  app.get("/lists", async (req, res) => {
    const { userId, movieId, sort, order, limit } = req.query;
    const lists = await dao.findListsByQuery({
      userId: userId as string | undefined,
      movieId: movieId as string | undefined,
      sort: sort as string,
      order: ["asc", "desc"].includes(order as string)
        ? (order as SortOrder)
        : undefined,
      limit: parseInt(limit as string),
    });
    res.send(lists);
  });

  app.post("/lists", async (req, res) => {
    const { title, description } = req.body;
    if (!title) {
      res.status(400).send("Invalid title");
      return;
    } else if (!description) {
      res.status(400).send("Invalid description");
      return;
    }
    const user = authenticatedEditor(req);
    if (!user) {
      res.sendStatus(401);
      return;
    }
    const list: NewList = {
      userId: user._id,
      title,
      description,
      date: new Date().toISOString(),
      entries: [],
    };

    const newList = await dao.createList(list);
    if (!newList) {
      res.sendStatus(400);
      return;
    }
    res.send(newList);
  });

  app.put("/lists/:listId", async (req, res) => {
    const { listId } = req.params;
    const { title, description } = req.body;

    const list = await dao.getListById(listId);
    if (!list) {
      res.sendStatus(404);
      return;
    }
    if (!authenticatedEditor(req, list.userId)) {
      res.sendStatus(401);
      return;
    }

    const updatedList = { ...list, title, description };
    const success = await dao.updateList(updatedList);
    if (!success) {
      res.sendStatus(400);
      return;
    }
    res.send(updatedList);
  });

  app.delete("/lists/:listId", async (req, res) => {
    const { listId } = req.params;

    const list = await dao.getListById(listId);
    if (!list) {
      res.sendStatus(404);
      return;
    }
    if (!authenticatedEditor(req, list.userId)) {
      res.sendStatus(401);
      return;
    }

    const success = await dao.deleteList(listId);
    if (!success) {
      res.sendStatus(400);
      return;
    }
    res.sendStatus(200);
  });

  app.post("/lists/:listId/entries", async (req, res) => {
    const { listId } = req.params;
    const { movieId, description } = req.body;
    if (!description) {
      res.status(400).send("Invalid description");
      return;
    }

    const list = await dao.getListById(listId);
    if (!list) {
      res.sendStatus(404);
      return;
    }
    if (!authenticatedEditor(req, list.userId)) {
      res.sendStatus(401);
      return;
    }

    const hasDuplicate = list.entries.find(
      (entry) => entry.movieId === movieId
    );
    const updatedEntires = hasDuplicate
      ? list.entries
      : [...list.entries, { movieId, description }];
    const updatedList: List = {
      ...list,
      entries: updatedEntires,
    };
    const success = await dao.updateList(updatedList);
    if (!success) {
      res.sendStatus(400);
      return;
    }
    res.send(updatedList);
  });

  app.put("/lists/:listId/entries/:movieId", async (req, res) => {
    const { listId, movieId } = req.params;
    const { description } = req.body;

    const list = await dao.getListById(listId);
    if (!list) {
      res.sendStatus(404);
      return;
    }
    if (!authenticatedEditor(req, list.userId)) {
      res.sendStatus(401);
      return;
    }

    const updatedEntires = list.entries.map((entry) =>
      entry.movieId === movieId ? { movieId, description } : entry
    );
    const updatedList: List = { ...list, entries: updatedEntires };
    const success = await dao.updateList(updatedList);
    if (!success) {
      res.sendStatus(400);
      return;
    }
    res.send({ movieId, description });
  });

  app.delete("/lists/:listId/entries/:movieId", async (req, res) => {
    const { listId, movieId } = req.params;

    const list = await dao.getListById(listId);
    if (!list) {
      res.sendStatus(404);
      return;
    }
    if (!authenticatedEditor(req, list.userId)) {
      res.sendStatus(401);
      return;
    }

    const updatedEntires = list.entries.filter(
      (entry) => entry.movieId !== movieId
    );
    const updatedList: List = { ...list, entries: updatedEntires };
    const success = await dao.updateList(updatedList);
    if (!success) {
      res.sendStatus(400);
      return;
    }
    res.sendStatus(200);
  });
}
