import React, { useState, useCallback, useRef, useEffect } from "react";
import "./App.css";

interface TaskProps {
  description: string;
  checked?: boolean;
  deleteTask?: (description: string) => void;
  checkTask?: (description: string, checked: boolean) => void;
}

const Task: React.FC<TaskProps> = ({
  description,
  checked,
  deleteTask = () => {},
  checkTask = () => {},
}) => {
  return (
    <li>
      <span style={{ textDecoration: checked ? "line-through" : "none" }}>
        {description}
      </span>
      <button onClick={() => deleteTask(description)}>❌</button>
      <input
      style={{fontSize: '3rem'}}
        type="checkbox"
        checked={checked}
        onChange={() => checkTask(description, !checked)}
      />
    </li>
  );
};

interface Task {
  description: string;
  checked?: boolean;
}

const persistTasks = (tasks: Task[]): void =>
  localStorage.setItem("react-ts-checklist-localstorage", JSON.stringify(tasks));

const getTasks = () =>
  JSON.parse(localStorage.getItem("tasks") as string) ?? [];

function App() {
  const [field, setField] = useState<{ value: string }>({ value: "" });
  const [tasks, setTasks] = useState<Task[]>(getTasks());
  const fieldElem = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log({ tasks, t: typeof tasks });

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
      const { value } = Object.fromEntries(formData.entries()) as {
        value: string;
      };
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

  const checkTask = useCallback(
    (description: string, checked: boolean): void => {
      setTasks((tasks) => {
        tasks.forEach((task, index) => {
          if (task.description === description) {
            tasks[index] = { ...task, checked };
          }
        });
        const newTasks = [...tasks];
        persistTasks(newTasks);
        return newTasks;
      });
    },
    []
  );

  return (
    <div className="app">
      <h1>Check List</h1>
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
            checked={task.checked}
            deleteTask={deleteTask}
            checkTask={checkTask}
          />
        ))}
      </ul>
    </div>
  );
}

export default App;
