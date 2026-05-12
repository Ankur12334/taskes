/* =========================
   DATE LOGIC
========================= */
const today = new Date();
const currentMonth = today.toLocaleString('default', { month: 'long' });
const currentYear = today.getFullYear();
// Get number of days in the current month
const daysInMonth = new Date(currentYear, today.getMonth() + 1, 0).getDate();

document.getElementById('monthTitle').innerText = `${currentMonth} Habit Tracker`;

/* =========================
   LOCAL STORAGE DATA
========================= */
// Provide initial IDs for default habits
const generateId = () => Math.random().toString(36).substr(2, 9);

let habits = JSON.parse(localStorage.getItem("habits")) || [
  { id: generateId(), name: "Wake Up Early" },
  { id: generateId(), name: "Workout" },
  { id: generateId(), name: "Reading" }
];

// Provide ID backwards compatibility for old data (if any existed without IDs)
habits.forEach(habit => {
  if (!habit.id) habit.id = generateId();
});

let checkedData = JSON.parse(localStorage.getItem("checkedData")) || {};

/* =========================
   TABLE HEADER SETUP
========================= */
const tableHeaderRow = document.getElementById("tableHeaderRow");
for (let i = 1; i <= daysInMonth; i++) {
  const th = document.createElement("th");
  th.innerText = i;
  tableHeaderRow.appendChild(th);
}

/* =========================
   SAVE DATA
========================= */
function saveData() {
  localStorage.setItem("habits", JSON.stringify(habits));
  localStorage.setItem("checkedData", JSON.stringify(checkedData));
}

/* =========================
   RENDER TABLE
========================= */
function renderTable() {
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";

  habits.forEach((habit) => {
    const row = document.createElement("tr");
    row.id = `row-${habit.id}`;

    /* HABIT NAME CELL */
    const habitCell = document.createElement("td");
    habitCell.className = "habit-name";
    
    const streak = calculateStreak(habit.id);

    habitCell.innerHTML = `
      <div class="habit-box">
        <span class="habit-title">${habit.name}</span>
        <small class="streak" id="streak-${habit.id}">🔥 ${streak} Day Streak</small>
        <div class="habit-actions">
          <button onclick="editHabit('${habit.id}')">✏️ Edit</button>
          <button class="del-btn" onclick="deleteHabit('${habit.id}')">🗑️ Delete</button>
        </div>
      </div>
    `;
    row.appendChild(habitCell);

    /* CHECKBOXES */
    for (let day = 1; day <= daysInMonth; day++) {
      const td = document.createElement("td");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "check";
      
      const key = `${habit.id}-${day}`;
      checkbox.checked = checkedData[key] || false;

      checkbox.addEventListener("change", () => {
        checkedData[key] = checkbox.checked;
        saveData();
        
        // Targeted DOM updates instead of full re-render
        updateStreakDOM(habit.id);
        updateProgress();
      });

      td.appendChild(checkbox);
      row.appendChild(td);
    }
    tbody.appendChild(row);
  });

  document.getElementById("totalHabits").innerText = habits.length;
  updateProgress();
}

/* =========================
   ADD HABIT
========================= */
function addHabit() {
  const input = document.getElementById("habitInput");
  const value = input.value.trim();
  if (value === "") return;

  habits.push({ id: generateId(), name: value });
  saveData();
  input.value = "";
  renderTable(); // Re-render table since structure changed
}

// Allow pressing Enter to add habit
document.getElementById('habitInput').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') addHabit();
});

/* =========================
   DELETE HABIT
========================= */
function deleteHabit(id) {
  if (!confirm("Delete this habit?")) return;

  // Remove from habits array
  habits = habits.filter(h => h.id !== id);

  // Clean checked data for this specific habit ID
  const newCheckedData = {};
  Object.keys(checkedData).forEach(key => {
    if (!key.startsWith(`${id}-`)) {
      newCheckedData[key] = checkedData[key];
    }
  });
  checkedData = newCheckedData;

  saveData();
  
  // Targeted removal from DOM
  const row = document.getElementById(`row-${id}`);
  if (row) row.remove();
  
  document.getElementById("totalHabits").innerText = habits.length;
  updateProgress();
}

/* =========================
   EDIT HABIT
========================= */
function editHabit(id) {
  const habitIndex = habits.findIndex(h => h.id === id);
  if (habitIndex === -1) return;

  const newName = prompt("Edit habit name:", habits[habitIndex].name);
  if (!newName || newName.trim() === "") return;

  habits[habitIndex].name = newName.trim();
  saveData();
  
  // Targeted DOM update
  const row = document.getElementById(`row-${id}`);
  if (row) {
    row.querySelector('.habit-title').innerText = habits[habitIndex].name;
  }
}

/* =========================
   RESET ALL
========================= */
function resetAll() {
  if (!confirm("Reset all progress? This will uncheck all boxes.")) return;
  checkedData = {};
  saveData();
  
  // Targeted uncheck
  document.querySelectorAll('.check').forEach(cb => cb.checked = false);
  habits.forEach(h => updateStreakDOM(h.id));
  updateProgress();
}

/* =========================
   STREAK CALCULATION
========================= */
function calculateStreak(id) {
  let streak = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const key = `${id}-${day}`;
    if (checkedData[key]) {
      streak++;
    } else {
      streak = 0; // Streak resets if a day is missed
    }
  }
  return streak;
}

function updateStreakDOM(id) {
  const streakEl = document.getElementById(`streak-${id}`);
  if (streakEl) {
    streakEl.innerText = `🔥 ${calculateStreak(id)} Day Streak`;
  }
}

/* =========================
   UPDATE PROGRESS
========================= */
function updateProgress() {
  const totalBoxes = habits.length * daysInMonth;
  const completed = Object.values(checkedData).filter(v => v).length;
  const progress = totalBoxes === 0 ? 0 : Math.round((completed / totalBoxes) * 100);

  document.getElementById("completedHabits").innerText = completed;
  document.getElementById("progressText").innerText = progress + "%";
  document.getElementById("percentage").innerText = progress + "% Completed";
  document.getElementById("progressFill").style.width = progress + "%";

  updateLevel(progress);
}

/* =========================
   LEVEL SYSTEM
========================= */
function updateLevel(progress) {
  let level = "Beginner";
  if (progress >= 20) level = "Focused";
  if (progress >= 40) level = "Disciplined";
  if (progress >= 60) level = "Consistent";
  if (progress >= 80) level = "Monster";
  if (progress >= 95) level = "God Mode";
  
  document.getElementById("levelText").innerText = level;
}

/* =========================
   DARK MODE
========================= */
function toggleDarkMode() {
  document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", document.body.classList.contains("dark"));
}

if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
}

/* =========================
   EXPORT / IMPORT DATA
========================= */
function exportData() {
  const data = { habits, checkedData };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `habit-tracker-backup-${currentMonth}.json`;
  link.click();
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data.habits && data.checkedData) {
        habits = data.habits;
        checkedData = data.checkedData;
        saveData();
        renderTable();
        alert('Data imported successfully!');
      } else {
        alert('Invalid file format. Missing habits or checkedData.');
      }
    } catch (err) {
      alert('Error reading the JSON file.');
    }
    // Reset file input so same file can be imported again if needed
    event.target.value = '';
  };
  reader.readAsText(file);
}

/* =========================
   QUOTES
========================= */
const quotes = [
  "Discipline beats motivation.",
  "Consistency creates success.",
  "Small habits change life.",
  "Your future is built daily.",
  "Focus on systems, not goals.",
  "1% better every day."
];

document.getElementById("quoteText").innerText = quotes[Math.floor(Math.random() * quotes.length)];

/* =========================
   INITIALIZE
========================= */
renderTable();
