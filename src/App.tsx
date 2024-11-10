import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
import "./App.css";
import clsx from "clsx";

const STORAGE_KEY = "react-ts-checklist-localstorage";

type ObserverCallbackType = (
  entries: IntersectionObserverEntry[],
  observer: IntersectionObserver
) => void;

const useIntersectionObserver = () => {
  const [isIntersected, setIsIntersected] = useState<boolean>(false);

  const observerCallback: ObserverCallbackType = useCallback((entries) => {
    const entry = entries[0];
    if (entry) {
      setIsIntersected(entry.isIntersecting);
    }
  }, []);

  const observer = useMemo(
    () => new IntersectionObserver(observerCallback),
    []
  );
  return { observer, isIntersected };
};

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
  const className = clsx("description", { strike: checked });

  return (
    <li>
      <button className="nix hover" onClick={() => deleteTask(description)}>
        ❌
      </button>
      <input
        type="checkbox"
        checked={checked}
        onChange={() => checkTask(description, !checked)}
      />
      <div className={className}>
        {description}
      </div>
    </li>
  );
};

interface Task {
  description: string;
  checked?: boolean;
}

const persistTasks = (tasks: Task[]): void =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));

const getTasks = () =>
  JSON.parse(localStorage.getItem(STORAGE_KEY) as string) ?? [];

function App() {
  const [field, setField] = useState<{ value: string }>({ value: "" });
  const [tasks, setTasks] = useState<Task[]>(getTasks());
  const fieldElem = useRef<HTMLInputElement>(null);

  const { observer, isIntersected } = useIntersectionObserver();
  const observedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (observedRef.current) {
      observer.observe(observedRef.current);
    }
  }, []);

  useEffect(() => {
    console.log({ tasks, t: typeof tasks });

    const handleStorageChange = () => setTasks(getTasks());
    window.addEventListener("storage", handleStorageChange);

    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const formClass = clsx("checklist-form", {
    "checklist-form-sticky": !isIntersected,
    "blur-background": !isIntersected,
  });

  const headerClass = clsx("form-header", {
    "blur-background": !isIntersected,
  });

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
          const updatedTasks = [...tasks];
          updatedTasks.unshift({ description: value });
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
      <header className={headerClass}>
      <h1><img src="/checkmark.svg" alt="checkmark" style={{position: 'absolute', height: '2rem', top: '-2rem', marginLeft: '-2rem', opacity: '.7'}} />Checklist</h1>
      </header>
      <div ref={observedRef}></div>
      <form className={formClass} style={{}} onSubmit={submitHandler}>
        <div className="form-input" style={{}}>

        <input
          className="checklist-field"
          ref={fieldElem}
          onChange={changeHandler}
          type="text"
          value={field.value}
          name="value"
          placeholder="Add your task"
        />
        <button className="checklist-submit">Submit</button>
        </div>
      </form>

      <ul className="check-list">
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
