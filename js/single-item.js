import { editCompleted, removeItem, setEditId } from "./app.js";

// Format due date for display
function formatDueDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString + "T00:00:00");
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return "Tomorrow";
  }

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Check if due date is overdue
function isOverdue(dateString) {
  if (!dateString) return false;
  const date = new Date(dateString + "T00:00:00");
  const today = new Date();
  return date < today;
}

// Create SingleItem Element
export function createSingleItem(item) {
  const div = document.createElement("div");
  div.className = "single-item";

  const dueDateClass =
    item.dueDate && isOverdue(item.dueDate) ? " overdue" : "";
  const dueDateDisplay = item.dueDate
    ? `<span class="due-date${dueDateClass}">${formatDueDate(item.dueDate)}</span>`
    : "";

  div.innerHTML = `
    <input type="checkbox" ${item.completed ? "checked" : ""} />
    <div class="item-content">
      <p style="text-decoration: ${item.completed ? "line-through" : "none"}">
        ${item.name}
      </p>
      ${dueDateDisplay}
    </div>
    <button class="btn icon-btn edit-btn" type="button">
      <i class="fa-regular fa-pen-to-square"></i>
    </button>
    <button class="btn icon-btn remove-btn" type="button">
      <i class="fa-regular fa-trash-can"></i>
    </button>
  `;

  const checkbox = div.querySelector('input[type="checkbox"]');
  checkbox.addEventListener("change", () => editCompleted(item.id));
  // Add event listener for edit button
  const editBtn = div.querySelector(".edit-btn");
  editBtn.addEventListener("click", () => setEditId(item.id));
  // Add event listener for remove button
  const removeBtn = div.querySelector(".remove-btn");
  removeBtn.addEventListener("click", () => removeItem(item.id));

  return div;
}
