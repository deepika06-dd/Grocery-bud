// ....
// import { groceryItems } from "./data.js";
import { createItems } from "./items.js";
import { createForm } from "./form.js";

// Toast Notification System
let toastId = 0;

// Sound effects
function playSound(type) {
  try {
    const audioContext = new (
      window.AudioContext || window.webkitAudioContext
    )();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Different frequencies for different types
    const frequencies = {
      success: 523.25, // C5
      error: 220, // A3
      info: 392, // G4
      warning: 311.13, // D#4
    };

    oscillator.frequency.value = frequencies[type] || 440;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.3,
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (e) {
    // Audio API not supported, silently fail
  }
}

// Subtle vibration (for devices that support it)
function triggerVibration() {
  if ("vibrate" in navigator) {
    navigator.vibrate([10, 5, 10]);
  }
}

function showToast(message, type = "success", duration = 4000) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  // Play sound effect
  playSound(type);

  // Trigger subtle vibration on mobile
  if (type === "success" || type === "error") {
    triggerVibration();
  }

  const id = ++toastId;
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.id = `toast-${id}`;

  // Get icon based on type
  const icons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
    warning: "⚠",
  };

  toast.innerHTML = `
    <div class="toast-content">
      <div class="toast-icon">${icons[type] || "ℹ"}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="close-btn" onclick="hideToast(${id})">&times;</button>
    <div class="toast-progress" style="animation-duration: ${duration}ms"></div>
  `;

  container.appendChild(toast);

  // Trigger animation
  setTimeout(() => {
    toast.style.transform = "translateX(0) scale(1) rotate(0)";
    toast.style.opacity = "1";
  }, 10);

  // Auto remove after duration
  setTimeout(() => hideToast(id), duration);
}

function hideToast(id) {
  const toast = document.getElementById(`toast-${id}`);
  if (toast) {
    toast.classList.add("hide");
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }
}

// Make hideToast globally available
window.hideToast = hideToast;

function getLocalStorage() {
  const list = localStorage.getItem("grocery-list");
  if (list) {
    return JSON.parse(list);
  }
  return [];
}

function setLocalStorage(itemsArray) {
  localStorage.setItem("grocery-list", JSON.stringify(itemsArray));
}

// Initialize items from local storage
let items = getLocalStorage();
let editId = null;
// Render App
function render() {
  const app = document.getElementById("app");
  app.innerHTML = "";
  const formElement = createForm(
    editId,
    editId ? items.find((item) => item.id === editId) : null,
  );
  const itemsElement = createItems(items);
  app.appendChild(formElement);
  app.appendChild(itemsElement);
}
render();
// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Add Item Function
export function addItem(itemName, dueDate = null) {
  const newItem = {
    name: itemName,
    completed: false,
    id: generateId(),
    dueDate: dueDate || null,
  };
  items = [...items, newItem];
  setLocalStorage(items);
  render();
  showToast("Item Added Successfully!", "success");
}
// Initialize App
render();
// Edit Completed Function
export function editCompleted(itemId) {
  items = items.map((item) => {
    if (item.id === itemId) {
      return { ...item, completed: !item.completed };
    }
    return item;
  });
  setLocalStorage(items);
  render();
}

// Remove Item Function
export function removeItem(itemId) {
  items = items.filter((item) => item.id !== itemId);
  setLocalStorage(items);
  render();
  showToast("Item Deleted Successfully!", "success");
}
// Update Item Name Function
export function updateItemName(newName, newDueDate = null) {
  items = items.map((item) => {
    if (item.id === editId) {
      return { ...item, name: newName, dueDate: newDueDate || item.dueDate };
    }
    return item;
  });
  editId = null;
  setLocalStorage(items);
  render();
  showToast("Item Updated Successfully!", "success");
}

// Set Edit ID Function
export function setEditId(itemId) {
  editId = itemId;
  render();

  // Focus input after render
  setTimeout(() => {
    const input = document.querySelector(".form-input");
    if (input) {
      input.focus();
    }
  }, 0);
}
