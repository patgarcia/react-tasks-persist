import React, { useState, useCallback, useRef, useEffect } from "react";
import "./App.css";

interface TaskProps {
  description: string;
  deleteTask?: (description: string) => void;
}

const Task: React.FC<TaskProps> = ({ description, deleteTask = () => {} }) => (
  <li>
    <span>{description}</span>
    <button onClick={() => deleteTask(description)}>Delete</button>
  </li>
);

interface Task {
  description: string;
}

const persistTasks = (tasks: Task[]): void =>
  localStorage.setItem("tasks", JSON.stringify(tasks));

const getTasks = () =>
  JSON.parse(localStorage.getItem("tasks") as string) ?? [];

function App() {
  const [field, setField] = useState<{ value: string }>({ value: "" });
  const [tasks, setTasks] = useState<Task[]>(getTasks());
  const fieldElem = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log({tasks, t: typeof tasks})

    const handleStorageChange = () => setTasks(getTasks());
    window.addEventListener("storage", handleStorageChange);

    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const changeHandler = useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = ev.target;
      let error = "";
      if (tasks.some((task) => task.description === value)) {
        error = `'${value}': Task already exists`;
      } else if (!value.length) {
        error = "Task description can't be empty";
      }
      fieldElem.current?.setCustomValidity(error);
      setField({ value });
    },
    [tasks]
  );

  const submitHandler = useCallback(
    (ev: React.FormEvent<HTMLFormElement>) => {
      ev.preventDefault();
      const taskExists = tasks.some((task) => task.description === field.value);
      const formData = new FormData(ev.currentTarget);
      const {value} = Object.fromEntries(formData.entries()) as {value: string};
      if (value?.length && !taskExists) {
        setTasks((tasks) => {
          const updatedTasks = [...tasks, { description: value }];
          persistTasks(updatedTasks);
          return updatedTasks;
        });
        setField({ value: "" });
      }
    },
    [tasks]
  );

  const deleteTask = useCallback((description: string): void => {
    setTasks((tasks) => {
      const filteredTasks = tasks.filter(
        (task) => task.description !== description
      );
      persistTasks(filteredTasks);
      return filteredTasks;
    });
  }, []);

  return (
    <div className="app">
      <h1>Todo List</h1>
      <div>
        <form onSubmit={submitHandler}>
          <input
            ref={fieldElem}
            onChange={changeHandler}
            type="text"
            value={field.value}
            name="value"
            placeholder="Add your task"
          />
          <div>
            <button>Submit</button>
          </div>
        </form>
      </div>
      <ul>
        {tasks.map((task) => (
          <Task
            key={task.description}
            description={task.description}
            deleteTask={deleteTask}
          />
        ))}
      </ul>
    </div>
  );
}

export default App;
