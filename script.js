const days = 30;

/* =========================
   LOCAL STORAGE DATA
========================= */

let habits =
  JSON.parse(localStorage.getItem("habits")) || [
    {
      name: "Wake Up Early"
    },
    {
      name: "Workout"
    },
    {
      name: "Reading"
    }
  ];

let checkedData =
  JSON.parse(localStorage.getItem("checkedData")) || {};

/* =========================
   TABLE HEADER
========================= */

const tableHead =
  document.querySelector("thead tr");

for (let i = 1; i <= days; i++) {

  const th = document.createElement("th");

  th.innerText = i;

  tableHead.appendChild(th);
}

/* =========================
   SAVE DATA
========================= */

function saveData() {

  localStorage.setItem(
    "habits",
    JSON.stringify(habits)
  );

  localStorage.setItem(
    "checkedData",
    JSON.stringify(checkedData)
  );
}

/* =========================
   RENDER TABLE
========================= */

function renderTable() {

  const tbody =
    document.querySelector("tbody");

  tbody.innerHTML = "";

  habits.forEach((habit, index) => {

    const row =
      document.createElement("tr");

    /* HABIT NAME CELL */

    const habitCell =
      document.createElement("td");

    habitCell.className =
      "habit-name";

    const streak =
      calculateStreak(index);

    habitCell.innerHTML = `
    
      <div class="habit-box">

        <span>
          ${habit.name}
        </span>

        <small>
          🔥 ${streak} Day Streak
        </small>

        <div class="habit-actions">

          <button onclick="editHabit(${index})">
            Edit
          </button>

          <button onclick="deleteHabit(${index})">
            Delete
          </button>

        </div>

      </div>
    `;

    row.appendChild(habitCell);

    /* CHECKBOXES */

    for (let day = 1; day <= days; day++) {

      const td =
        document.createElement("td");

      const checkbox =
        document.createElement("input");

      checkbox.type = "checkbox";

      checkbox.className = "check";

      const key = `${index}-${day}`;

      checkbox.checked =
        checkedData[key] || false;

      checkbox.addEventListener(
        "change",
        () => {

          checkedData[key] =
            checkbox.checked;

          saveData();

          updateProgress();
        }
      );

      td.appendChild(checkbox);

      row.appendChild(td);
    }

    tbody.appendChild(row);
  });

  document.getElementById(
    "totalHabits"
  ).innerText = habits.length;

  updateProgress();
}

/* =========================
   ADD HABIT
========================= */

function addHabit() {

  const input =
    document.getElementById(
      "habitInput"
    );

  const value =
    input.value.trim();

  if (value === "") return;

  habits.push({
    name: value
  });

  saveData();

  input.value = "";

  renderTable();
}

/* =========================
   DELETE HABIT
========================= */

function deleteHabit(index) {

  const confirmDelete =
    confirm(
      "Delete this habit?"
    );

  if (!confirmDelete) return;

  habits.splice(index, 1);

  /* CLEAN OLD CHECKBOX DATA */

  const newCheckedData = {};

  habits.forEach((_, i) => {

    for (
      let day = 1;
      day <= days;
      day++
    ) {

      const oldKey =
        `${i >= index ? i + 1 : i}-${day}`;

      const newKey =
        `${i}-${day}`;

      if (checkedData[oldKey]) {

        newCheckedData[newKey] =
          checkedData[oldKey];
      }
    }
  });

  checkedData = newCheckedData;

  saveData();

  renderTable();
}

/* =========================
   EDIT HABIT
========================= */

function editHabit(index) {

  const newName = prompt(
    "Edit habit name:",
    habits[index].name
  );

  if (!newName) return;

  habits[index].name =
    newName.trim();

  saveData();

  renderTable();
}

/* =========================
   RESET ALL
========================= */

function resetAll() {

  const confirmReset =
    confirm(
      "Reset all progress?"
    );

  if (!confirmReset) return;

  checkedData = {};

  saveData();

  renderTable();
}

/* =========================
   STREAK CALCULATION
========================= */

function calculateStreak(index) {

  let streak = 0;

  for (
    let day = 1;
    day <= days;
    day++
  ) {

    const key =
      `${index}-${day}`;

    if (checkedData[key]) {

      streak++;

    } else {

      streak = 0;
    }
  }

  return streak;
}

/* =========================
   UPDATE PROGRESS
========================= */

function updateProgress() {

  const totalBoxes =
    habits.length * days;

  const completed =
    Object.values(
      checkedData
    ).filter(v => v).length;

  const progress =
    Math.round(
      (
        completed /
        totalBoxes
      ) * 100
    ) || 0;

  document.getElementById(
    "completedHabits"
  ).innerText = completed;

  document.getElementById(
    "progressText"
  ).innerText =
    progress + "%";

  document.getElementById(
    "percentage"
  ).innerText =
    progress + "% Completed";

  document.getElementById(
    "progressFill"
  ).style.width =
    progress + "%";

  updateLevel(progress);
}

/* =========================
   LEVEL SYSTEM
========================= */

function updateLevel(progress) {

  let level = "Beginner";

  if (progress >= 20)
    level = "Focused";

  if (progress >= 40)
    level = "Disciplined";

  if (progress >= 60)
    level = "Consistent";

  if (progress >= 80)
    level = "Monster";

  if (progress >= 95)
    level = "God Mode";

  document.getElementById(
    "levelText"
  ).innerText = level;
}

/* =========================
   DARK MODE
========================= */

function toggleDarkMode() {

  document.body.classList.toggle(
    "dark"
  );

  localStorage.setItem(
    "darkMode",
    document.body.classList.contains(
      "dark"
    )
  );
}

/* LOAD DARK MODE */

if (
  localStorage.getItem(
    "darkMode"
  ) === "true"
) {

  document.body.classList.add(
    "dark"
  );
}

/* =========================
   EXPORT DATA
========================= */

function exportData() {

  const data = {

    habits,
    checkedData

  };

  const blob = new Blob(
    [JSON.stringify(data, null, 2)],
    {
      type: "application/json"
    }
  );

  const link =
    document.createElement("a");

  link.href =
    URL.createObjectURL(blob);

  link.download =
    "habit-tracker-data.json";

  link.click();
}

/* =========================
   QUOTES
========================= */

const quotes = [

  "Discipline beats motivation.",

  "Consistency creates success.",

  "Small habits change life.",

  "Your future is built daily.",

  "Focus on systems, not goals."

];

const randomQuote =
  quotes[
    Math.floor(
      Math.random() *
      quotes.length
    )
  ];

document.getElementById(
  "quoteText"
).innerText = randomQuote;

/* =========================
   INITIALIZE
========================= */

renderTable();