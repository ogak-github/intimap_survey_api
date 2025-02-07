import { Router, Request, Response, Application } from "express";
import pool from "./db";
import { log } from "console";

const router = Router();

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

router.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the To-Do List App!");
});

router.get("/todos", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM todo");
    const todos: Todo[] = result.rows;
    res.json(todos);
  } catch (error) {
    console.error("Error fetching todos", error);
    res.status(500).json({ error: "Error fetching todos" });
  }
});

router.post("/todos", async (req: Request, res: Response) => {
  const { title, completed } = req.body;
  
  if (req.body == null) {
    res.status(400).json({ error: "Insert value" });
    return;
  }

  try {
    const result = await pool.query(
      "INSERT INTO todo (title, completed) VALUES ($1, $2) RETURNING id, title, completed",
      [title, completed]
    );
    const createdTodo: Todo = result.rows[0];
    res.status(201).json(createdTodo);
  } catch (error) {
    console.error("Error adding todo", error);
    res.status(500).json({ error: "Error adding todo" });
  }
});

router.delete("/todos/:id", async (req: Request, res: Response) => {
  const todoID = parseInt(req.params.id, 10);
  try {
    await pool.query("DELETE FROM todo WHERE id = $1", [todoID]);
    res.sendStatus(200);
  } catch (error) {
    console.error("Error deleting todo", error);
    res.status(500).json({ error: "Error deleting todo" });
  }
});


router.put("/todos/:id", async (req: Request, res: Response) => {
  const todoID = parseInt(req.params.id, 10);
  const { task } = req.body;

  try {
    await pool.query("UPDATE todo SET task = $1 WHERE id = $2", [
      task,
      todoID,
    ]);
    res.sendStatus(200);
  } catch (error) {
    console.error("Error updating todo", error);
    res.sendStatus(500).json({ error: "Error updating todo" });
  }
});



export default router;