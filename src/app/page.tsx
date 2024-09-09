"use client";

import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../utils/firebase";

// Interfaces
interface Task {
  id: string;
  title: string;
  description: string;
  date: string;
  status: "TODO" | "IN PROGRESS" | "COMPLETED";
  priority: "High" | "Medium" | "Low";
}

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: Omit<Task, "id">) => void;
}

interface TaskColumnProps {
  title: string;
  tasks: Task[];
  onStatusChange: (id: string, newStatus: Task["status"]) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

interface TaskItemProps {
  task: Task;
  onStatusChange: TaskColumnProps["onStatusChange"];
  onEdit: TaskColumnProps["onEdit"];
  onDelete: TaskColumnProps["onDelete"];
}

// CreateTaskModal Component
function CreateTaskModal({ isOpen, onClose, onSubmit }: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<Task["status"]>("TODO");
  const [priority, setPriority] = useState<Task["priority"]>("Medium");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, description, date, status, priority });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create New Task</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              rows={3}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Select Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Task["status"])}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="TODO">TODO</option>
              <option value="IN PROGRESS">IN PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Task["priority"])}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// TaskColumn Component
function TaskColumn({
  title,
  tasks,
  onStatusChange,
  onEdit,
  onDelete,
}: TaskColumnProps) {
  return (
    <div className="flex-1 mx-3 bg-gray-100 p-4 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onStatusChange={onStatusChange}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

// TaskItem Component
function TaskItem({ task, onStatusChange, onEdit, onDelete }: TaskItemProps) {
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onStatusChange(task.id, e.target.value as Task["status"]);
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="bg-white p-4 mb-4 rounded-lg shadow flex justify-between items-center">
      <div className="flex-1 mr-4">
        <span
          className={`text-xs px-2 py-1 rounded text-white ${getPriorityColor(
            task.priority
          )}`}
        >
          {task.priority.toUpperCase()}
        </span>
        <h3 className="text-lg font-semibold mt-2">{task.title}</h3>
        <p className="text-gray-600">{task.description}</p>
        <small className="text-gray-500">
          {new Date(task.date).toLocaleDateString()}
        </small>
      </div>
      <div className="flex flex-col items-end">
        <select
          value={task.status}
          onChange={handleStatusChange}
          className="mb-2 p-1 border border-gray-300 rounded"
        >
          <option value="TODO">TODO</option>
          <option value="IN PROGRESS">IN PROGRESS</option>
          <option value="COMPLETED">COMPLETED</option>
        </select>
        <button
          onClick={() => onEdit(task.id)}
          className="mb-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

// Main Home Component
export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "tasks"), (snapshot) => {
      const tasksData = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Task)
      );
      setTasks(tasksData);
    });

    return () => unsubscribe();
  }, []);

  const handleCreateTask = async (taskData: Omit<Task, "id">) => {
    await addDoc(collection(db, "tasks"), taskData);
    setIsModalOpen(false);
  };

  const handleStatusChange = async (id: string, newStatus: Task["status"]) => {
    await updateDoc(doc(db, "tasks", id), { status: newStatus });
  };

  const handleEdit = (id: string) => {
    console.log("Editing task with id:", id);
    // Implement edit functionality
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "tasks", id));
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <header className="flex justify-between items-center bg-white p-6 border-b border-gray-200 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold">Board Infinity</h1>
          <p className="text-xl text-gray-600">
            Your Task Management Dashboard
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
        >
          Create Task
        </button>
      </header>

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTask}
      />

      <div className="flex justify-between mt-6">
        <TaskColumn
          title="TODO"
          tasks={tasks.filter((task) => task.status === "TODO")}
          onStatusChange={handleStatusChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        <TaskColumn
          title="IN PROGRESS"
          tasks={tasks.filter((task) => task.status === "IN PROGRESS")}
          onStatusChange={handleStatusChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        <TaskColumn
          title="COMPLETED"
          tasks={tasks.filter((task) => task.status === "COMPLETED")}
          onStatusChange={handleStatusChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}