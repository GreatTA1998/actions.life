import {
  todoTasks,
  todoMemoryTree,
  calendarTasks,
  calendarMemoryTree,
  tasksScheduledOn,
  inclusiveWeekTodo,
  uniqueEvents
} from "/src/store/index.js";
import { get } from "svelte/store";
import {
  reconstructTreeInMemory,
  constructCalendarTrees,
  computeDateToTasksDict,
} from "/src/helpers/dataStructures.js";

export function buildEventsDataStructures({ flatArray }) {
  const memoryTree = constructCalendarTrees(flatArray);
  const dateToTasks = computeDateToTasksDict(memoryTree);
  uniqueEvents.set(dateToTasks)
}

export function buildCalendarDataStructures({ flatArray }) {
  calendarTasks.set(flatArray);
  const memoryTree = constructCalendarTrees(flatArray);
  calendarMemoryTree.set(memoryTree);
  const dateToTasks = computeDateToTasksDict(memoryTree);
  tasksScheduledOn.set(dateToTasks);
}

export function buildTodoDataStructures({ flatArray }) {
  todoTasks.set(flatArray);
  todoMemoryTree.set(reconstructTreeInMemory(get(todoTasks)));
  inclusiveWeekTodo.set(get(todoMemoryTree));
}