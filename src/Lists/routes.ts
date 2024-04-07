import { Express } from "express";
import { List } from "../Database/types";
import { authenticatedEditor } from "../Account/authentication";
import db from "../Database";

export default function ListRoutes(app: Express) {
  app.post("/lists", async (req, res) => {
    const { newList }: { newList: List } = req.body;
    newList.date = new Date().toISOString().split("T")[0];
    newList._id = crypto.randomUUID();

    if (!authenticatedEditor(req, res, newList.userId)) {
      return;
    } else if (!newList.title) {
      res.status(400).send("Invalid title");
      return;
    }

    db.lists = [...db.lists, newList];
    res.send(newList);
  });
  app.put("/lists/:listId", async (req, res) => {
    const { listId } = req.params;
    const {
      title,
      description,
    }: {
      title: string;
      description: string;
    } = req.body;

    const user = authenticatedEditor(req, res);
    if (!user) {
      return;
    } else if (!title) {
      res.status(400).send("Invalid title");
      return;
    }

    try {
      db.lists = db.lists.map((list) => {
        if (list._id !== listId) {
          return list;
        }
        if (list.userId !== user._id) {
          res.sendStatus(401);
          throw new Error("Unauthorized");
        }
        return {
          ...list,
          title,
          description,
        };
      });
    } catch {
      return;
    }
    const updatedList = db.lists.find((list) => list._id === listId);
    res.send(updatedList);
  });
  app.delete("/lists/:listId", (req, res) => {
    const { listId } = req.params;

    const user = authenticatedEditor(req, res);
    if (!user) {
      return;
    }

    try {
      db.lists = db.lists.filter((list) => {
        if (list._id !== listId) {
          return true;
        }
        if (list.userId !== user._id) {
          res.sendStatus(401);
          throw new Error("Unauthorized");
        }
        return false;
      });
    } catch {
      return;
    }
    res.sendStatus(200);
  });

  app.post("/lists/:listId/", async (req, res) => {
    const { listId } = req.params;
    const {
      movieId,
      description,
    }: {
      movieId: string;
      description: string;
    } = req.body;

    const user = authenticatedEditor(req, res);
    if (!user) {
      return;
    } else if (!movieId) {
      res.status(400).send("Invalid title");
      return;
    } else if (!description) {
      res.status(400).send("Invalid description");
      return;
    }

    try {
      db.lists = db.lists.map((list) => {
        if (list._id !== listId) {
          return list;
        }
        if (list.userId !== user._id) {
          res.sendStatus(401);
          throw new Error("Unauthorized");
        }
        if (list.movies.find((movie) => movie.movieId === movieId)) {
          res.sendStatus(400);
          throw new Error("Duplicate movie");
        }
        return {
          ...list,
          movies: [...list.movies, { movieId, description }],
        };
      });
    } catch {
      return;
    }
    res.send({ movieId, description });
  });
  app.put("/lists/:listId/:movieId", async (req, res) => {
    const { listId, movieId } = req.params;
    const { description }: { description: string } = req.body;

    const user = authenticatedEditor(req, res);
    if (!user) {
      return;
    } else if (!movieId) {
      res.status(400).send("Invalid title");
      return;
    }

    try {
      db.lists = db.lists.map((list) => {
        if (list._id !== listId) {
          return list;
        }
        if (list.userId !== user._id) {
          res.sendStatus(401);
          throw new Error("Unauthorized");
        }
        const updatedMovies = list.movies.map((movie) => {
          if (movie.movieId !== movieId) {
            return movie;
          }
          return { movieId, description };
        });
        return {
          ...list,
          movies: updatedMovies,
        };
      });
    } catch {
      return;
    }
    const updatedList = db.lists.find((list) => list._id === listId);
    res.send({ movieId, description });
  });
  app.delete("/lists/:listId/:movieId", async (req, res) => {
    const { listId, movieId } = req.params;

    const user = authenticatedEditor(req, res);
    if (!user) {
      return;
    } else if (!movieId) {
      res.status(400).send("Invalid title");
      return;
    }

    try {
      db.lists = db.lists.map((list) => {
        if (list._id !== listId) {
          return list;
        }
        if (list.userId !== user._id) {
          res.sendStatus(401);
          throw new Error("Unauthorized");
        }
        const updatedMovies = list.movies.filter(
          (movie) => movie.movieId !== movieId
        );
        return {
          ...list,
          movies: updatedMovies,
        };
      });
    } catch {
      return;
    }
    res.sendStatus(200);
  });
}
