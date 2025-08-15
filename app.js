const employeeForm = document.getElementById("employeeForm");
const showEmployeeFormBtn = document.getElementById("showEmployeeForm");
const cancelEmployeeFormBtn = document.getElementById("cancelEmployeeForm");
const storyForm = document.getElementById("storyForm");
const showStoryFormBtn = document.getElementById("showStoryForm");
const cancelStoryFormBtn = document.getElementById("cancelStoryForm");
const toggleDueDatesBtn = document.getElementById("toggleDueDates");

showEmployeeFormBtn.addEventListener("click", () => {
  employeeForm.style.display = "grid";
  showEmployeeFormBtn.style.display = "none";
});

cancelEmployeeFormBtn.addEventListener("click", () => {
  employeeForm.style.display = "none";
  showEmployeeFormBtn.style.display = "block";
  employeeForm.reset();
});

showStoryFormBtn.addEventListener("click", () => {
  storyForm.style.display = "grid";
  showStoryFormBtn.style.display = "none";
});

cancelStoryFormBtn.addEventListener("click", () => {
  storyForm.style.display = "none";
  showStoryFormBtn.style.display = "block";
  storyForm.reset();
});

toggleDueDatesBtn.addEventListener("click", () => {
  const details = document.getElementById("dueDatesDetails");
  details.classList.toggle("active");
});

// State
const state = {
  sprint: {
    startDateISO: null,
    weeks: 2,
    extensionDays: 0,
    defaultDailyHours: 7,
    startTime: "09:00",
    workStartTime: "09:00",
    workEndTime: "16:00",
    officialHolidays: [], // [{dateISO, name}]
  },
  employees: [
    { id: 1, name: "Omar Gamel", dailyHours: 7, leaves: [] },
    { id: 2, name: "Esraa Abo Eleneen", dailyHours: 7, leaves: [] },
    { id: 3, name: "Ghada Mohamed Salah", dailyHours: 7, leaves: [] },
    { id: 4, name: "Mahmoud Samir", dailyHours: 7, leaves: [] },
    { id: 5, name: "Manar Ahmed", dailyHours: 7, leaves: [] },
    { id: 6, name: "Shaher Ashraf", dailyHours: 7, leaves: [] },
  ],
  stories: [],
  counters: { employee: 7, story: 1, task: 1 },
};

// Confirmation state tracking for delete buttons
const confirmationState = {
  pendingConfirmations: new Map(), // action-id -> timeout
  timeoutDuration: 3000, // 3 seconds
};

// Helper functions for confirmation system
function getConfirmationKey(action, id) {
  return `${action}-${id}`;
}

function isPendingConfirmation(action, id) {
  const key = getConfirmationKey(action, id);
  return confirmationState.pendingConfirmations.has(key);
}

function setPendingConfirmation(action, id, button) {
  const key = getConfirmationKey(action, id);

  // Clear any existing timeout
  if (confirmationState.pendingConfirmations.has(key)) {
    clearTimeout(confirmationState.pendingConfirmations.get(key));
  }

  // Set button to confirmation state
  button.textContent = "Confirm";
  button.classList.add("confirming");

  // Set timeout to reset
  const timeout = setTimeout(() => {
    resetConfirmation(action, id, button);
  }, confirmationState.timeoutDuration);

  confirmationState.pendingConfirmations.set(key, timeout);
}

function resetConfirmation(action, id, button) {
  const key = getConfirmationKey(action, id);

  if (confirmationState.pendingConfirmations.has(key)) {
    clearTimeout(confirmationState.pendingConfirmations.get(key));
    confirmationState.pendingConfirmations.delete(key);
  }

  if (button) {
    button.textContent = getOriginalButtonText(action);
    button.classList.remove("confirming");
  }
}

function getOriginalButtonText(action) {
  const textMap = {
    "remove-emp": "Remove",
    "remove-story": "Remove Story",
    "remove-task": "Remove",
    "remove-holiday": "Remove",
    clearOfficialHolidays: "Clear All",
  };
  return textMap[action] || "Remove";
}

// DOM refs
const sprintForm = document.getElementById("sprintForm");
const sprintStartInput = document.getElementById("sprintStart");
const sprintWeeksInput = document.getElementById("sprintWeeks");
const sprintExtensionDaysInput = document.getElementById("sprintExtensionDays");
const defaultDailyHoursInput = document.getElementById("defaultDailyHours");
const resetAllBtn = document.getElementById("resetAll");
const sprintStartTimeInput = document.getElementById("sprintStartTime");
const workStartTimeInput = document.getElementById("workStartTime");
const workEndTimeInput = document.getElementById("workEndTime");
const officialHolidayDateInput = document.getElementById("officialHolidayDate");
const officialHolidayNameInput = document.getElementById("officialHolidayName");
const addOfficialHolidayBtn = document.getElementById("addOfficialHoliday");
const clearOfficialHolidaysBtn = document.getElementById(
  "clearOfficialHolidays"
);
const officialHolidayList = document.getElementById("officialHolidayList");

const employeeNameInput = document.getElementById("employeeName");
const employeeDailyHoursInput = document.getElementById("employeeDailyHours");
const employeeList = document.getElementById("employeeList");

const storyTitleInput = document.getElementById("storyTitle");
const storiesList = document.getElementById("storiesList");

const computeBtn = document.getElementById("computeBtn");
const scheduleRoot = document.getElementById("schedule");
const taskSummaryRoot = document.getElementById("taskSummary");
const storySummaryRoot = document.getElementById("storySummary");
const timelineCanvas = document.getElementById("timelineCanvas");
const timelineContainer = document.getElementById("timelineContainer");
const timelineZoomInput = document.getElementById("timelineZoom");
const timelineZoomValue = document.getElementById("timelineZoomValue");
const renderTimelineBtn = document.getElementById("renderTimelineBtn");
const downloadTimelinePngBtn = document.getElementById("downloadTimelinePng");
const printTimelineBtn = document.getElementById("printTimeline");

// Modal refs
const taskModal = document.getElementById("taskModal");
const taskModalForm = document.getElementById("taskModalForm");
const taskModalStoryId = document.getElementById("taskModalStoryId");
const taskModalTaskId = document.getElementById("taskModalTaskId");
const taskModalTitleInput = document.getElementById("taskModalTitleInput");
const taskModalEstimateText = document.getElementById("taskModalEstimateText");
const taskModalAssignee = document.getElementById("taskModalAssignee");
const taskModalDepList = document.getElementById("taskModalDepList");
const closeTaskModalBtn = document.getElementById("closeTaskModal");
const taskModalSubmitBtn = document.getElementById("taskModalSubmitBtn");

// Utilities
function todayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}
function parseISO(iso) {
  const d = new Date(iso + "T00:00:00");
  d.setHours(0, 0, 0, 0);
  return d;
}
function fmtISO(d) {
  const c = new Date(d);
  return [
    c.getFullYear(),
    String(c.getMonth() + 1).padStart(2, "0"),
    String(c.getDate()).padStart(2, "0"),
  ].join("-");
}
function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d;
}
function isWeekend(date) {
  const day = date.getDay();
  return day === 5 || day === 6;
}
function humanDate(date) {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const y = date.getFullYear();
  const weekday = date.toLocaleDateString(undefined, { weekday: "short" });
  return `${weekday}, ${m}/${d}/${y}`;
}
function humanDateOnly(date) {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const y = date.getFullYear();
  return `${m}/${d}/${y}`;
}
function humanDateTime(date) {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const y = date.getFullYear();
  let hh = date.getHours();
  const ampm = hh >= 12 ? "PM" : "AM";
  hh = hh % 12;
  if (hh === 0) hh = 12;
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${m}/${d}/${y} ${hh}:${mm} ${ampm}`;
}
function minutesToHuman(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

function uid(prefix) {
  const id = state.counters[prefix]++;
  save();
  return id;
}

// Storage
function save() {
  localStorage.setItem("sprintPlannerState", JSON.stringify(state));
}
function load() {
  const raw = localStorage.getItem("sprintPlannerState");
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      Object.assign(state, parsed);
    } catch {}
  }
  if (!state.sprint.startDateISO) state.sprint.startDateISO = todayISO();
}

// Init forms from state
function hydrateForms() {
  sprintStartInput.value = state.sprint.startDateISO;
  sprintWeeksInput.value = state.sprint.weeks;
  sprintExtensionDaysInput.value = state.sprint.extensionDays;
  defaultDailyHoursInput.value = state.sprint.defaultDailyHours;
  employeeDailyHoursInput.placeholder = `Default ${state.sprint.defaultDailyHours}`;
  sprintStartTimeInput.value = state.sprint.startTime || "09:00";
  workStartTimeInput.value = state.sprint.workStartTime || "09:00";
  workEndTimeInput.value = state.sprint.workEndTime || "16:00";
  renderOfficialHolidays();
}

function renderOfficialHolidays() {
  const list = state.sprint.officialHolidays || [];
  if (!list.length) {
    officialHolidayList.innerHTML =
      '<div class="note">No official holidays added.</div>';
    return;
  }
  const rows = list
    .map((h, idx) => {
      const d = parseISO(h.dateISO);
      const weekday = d.toLocaleDateString(undefined, { weekday: "short" });
      return `
      <tr>
        <td><strong>${escapeHtml(h.name || "Holiday")}</strong></td>
        <td><span class="chip date date-holiday">${
          h.dateISO
        }</span> <span class="meta" style="margin-left:6px;">${weekday}</span></td>
        <td>
          <button class="btn small danger" data-action="remove-holiday" data-idx="${idx}">Remove</button>
        </td>
      </tr>`;
    })
    .join("");
  officialHolidayList.innerHTML = `
    <div style="overflow:auto;">
      <table class="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

officialHolidayList.addEventListener("click", (e) => {
  const target = e.target;
  if (!(target instanceof HTMLElement)) return;
  const action = target.getAttribute("data-action");
  if (action === "remove-holiday") {
    const idx = Number(target.getAttribute("data-idx"));
    if (!isPendingConfirmation(action, idx)) {
      // First click - set confirmation state
      setPendingConfirmation(action, idx, target);
      return;
    }

    // Second click - confirm deletion
    resetConfirmation(action, idx, target);
    state.sprint.officialHolidays.splice(idx, 1);
    save();
    renderOfficialHolidays();
  }
});

addOfficialHolidayBtn.addEventListener("click", () => {
  const dateISO = officialHolidayDateInput.value;
  const name = officialHolidayNameInput.value.trim();
  if (!dateISO) return;
  if (!state.sprint.officialHolidays) state.sprint.officialHolidays = [];
  if (!state.sprint.officialHolidays.find((h) => h.dateISO === dateISO)) {
    state.sprint.officialHolidays.push({ dateISO, name });
    save();
    renderOfficialHolidays();
  }
  officialHolidayDateInput.value = "";
  officialHolidayNameInput.value = "";
});

clearOfficialHolidaysBtn.addEventListener("click", () => {
  if (!isPendingConfirmation("clearOfficialHolidays", 0)) {
    // First click - set confirmation state
    setPendingConfirmation(
      "clearOfficialHolidays",
      0,
      clearOfficialHolidaysBtn
    );
    return;
  }

  // Second click - confirm deletion
  resetConfirmation("clearOfficialHolidays", 0, clearOfficialHolidaysBtn);
  state.sprint.officialHolidays = [];
  save();
  renderOfficialHolidays();
});

// Sprint dates generation
function getSprintDates() {
  const start = parseISO(state.sprint.startDateISO);
  const totalDays = state.sprint.weeks * 7 + state.sprint.extensionDays;
  const days = [];
  for (let i = 0; i < totalDays; i++) days.push(addDays(start, i));
  return days;
}
function getSprintEndDate() {
  const days = getSprintDates();
  return days[days.length - 1];
}

// Employees UI
function renderEmployees() {
  if (!state.employees.length) {
    employeeList.innerHTML =
      '<div class="item"><div>No employees yet.</div></div>';
    return;
  }

  // Migrate old leave data format to new format
  state.employees.forEach((emp) => {
    if (emp.leaves && emp.leaves.length > 0) {
      emp.leaves = emp.leaves.map((leave) => {
        if (typeof leave === "string") {
          return { date: leave, type: "leave" };
        }
        return leave;
      });
    }
  });
  const rowsHtml = state.employees
    .map((emp) => {
      const leaves = Array.from(emp.leaves || []);
      const leavesChips = leaves.length
        ? leaves
            .map((leave) => {
              const date = typeof leave === "string" ? leave : leave.date;
              const type =
                typeof leave === "string" ? "leave" : leave.type || "leave";
              const typeClass =
                type === "sick"
                  ? "date-sick"
                  : type === "vacation"
                  ? "date-vacation"
                  : type === "personal"
                  ? "date-personal"
                  : "date-leave";
              return `<span class="chip date ${typeClass}" title="${type}">${date}</span>`;
            })
            .join("")
        : '<span class="chip off">No personal leave</span>';
      return `
      <tr>
        <td><strong>${escapeHtml(emp.name)}</strong></td>
        <td><input type="number" class="daily-hours-input" data-action="change-daily-hours" data-id="${
          emp.id
        }" value="${emp.dailyHours}" min="0" max="24" step="0.5">h/day</td>
        <td><div class="chips" data-emp-id="${emp.id}" id="leaves-${
        emp.id
      }">${leavesChips}</div></td>
        <td>
          <div class="leave-controls">
            <input type="date" id="leaveDate-${
              emp.id
            }" class="leave-date-input">
            <select id="leaveType-${emp.id}" class="leave-type-select">
              <option value="leave">Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="vacation">Vacation</option>
              <option value="personal">Personal</option>
              <option value="other">Other</option>
            </select>
            <button class="btn small primary" data-action="add-leave" data-id="${
              emp.id
            }">Add Leave</button>
          </div>
        </td>
        <td>
          <div style="display:flex;gap:6px;">
            <button class="btn small" data-action="reset-leaves" data-id="${
              emp.id
            }">Clear Leaves</button>
            <button class="btn small danger" data-action="remove-emp" data-id="${
              emp.id
            }">Remove</button>
          </div>
        </td>
      </tr>`;
    })
    .join("");
  employeeList.innerHTML = `
    <div style="overflow:auto;">
      <table class="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Hours/day</th>
            <th>Leaves</th>
            <th>Add Leave</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>
  `;
}

employeeList.addEventListener("click", (e) => {
  const target = e.target;
  if (!(target instanceof HTMLElement)) return;
  const action = target.getAttribute("data-action");
  const id = Number(target.getAttribute("data-id"));
  if (!action || !id) return;
  if (action === "remove-emp") {
    if (!isPendingConfirmation(action, id)) {
      // First click - set confirmation state
      setPendingConfirmation(action, id, target);
      return;
    }

    // Second click - confirm deletion
    resetConfirmation(action, id, target);
    state.stories.forEach((story) => {
      story.tasks = story.tasks.filter((t) => t.assigneeId !== id);
      story.tasks.forEach((t) => {
        t.dependencies = (t.dependencies || []).filter((depId) => {
          const depTask = story.tasks.find((tsk) => tsk.id === depId);
          return depTask && depTask.assigneeId !== id;
        });
      });
    });
    state.employees = state.employees.filter((e) => e.id !== id);
    save();
    renderEmployees();
    renderStories();
  }
  if (action === "reset-leaves") {
    const emp = state.employees.find((e) => e.id === id);
    if (!emp) return;
    emp.leaves = [];
    save();
    renderEmployees();
  }
  if (action === "add-leave") {
    const dateInput = document.getElementById(`leaveDate-${id}`);
    const typeSelect = document.getElementById(`leaveType-${id}`);
    const iso = dateInput.value;
    const type = typeSelect.value;
    if (!iso) return;
    const emp = state.employees.find((e) => e.id === id);
    if (!emp) return;
    if (!emp.leaves) emp.leaves = [];
    const leaveEntry = { date: iso, type: type };
    const existingIndex = emp.leaves.findIndex((l) => l.date === iso);
    if (existingIndex >= 0) {
      emp.leaves[existingIndex] = leaveEntry;
    } else {
      emp.leaves.push(leaveEntry);
    }
    dateInput.value = "";
    typeSelect.value = "leave";
    save();
    renderEmployees();
  }
});

employeeList.addEventListener("change", (e) => {
  const target = e.target;
  if (!(target instanceof HTMLInputElement)) return;
  const action = target.getAttribute("data-action");
  const id = Number(target.getAttribute("data-id"));
  if (action !== "change-daily-hours" || !id) return;
  const emp = state.employees.find((e) => e.id === id);
  if (!emp) return;
  const hours = Number(target.value);
  if (!Number.isFinite(hours) || hours < 0 || hours > 24) {
    alert("Daily hours must be between 0 and 24.");
    target.value = emp.dailyHours; // Revert to previous value
    return;
  }
  emp.dailyHours = hours;
  save();
  renderEmployees();
  renderSchedule();
});

employeeForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = employeeNameInput.value.trim();
  if (!name) return;
  const hours =
    Number(employeeDailyHoursInput.value) || state.sprint.defaultDailyHours;
  const emp = { id: uid("employee"), name, dailyHours: hours, leaves: [] };
  state.employees.push(emp);
  employeeNameInput.value = "";
  employeeDailyHoursInput.value = "";
  employeeForm.style.display = "none";
  showEmployeeFormBtn.style.display = "block";
  save();
  renderEmployees();
  renderStories();
});

// Stories & Tasks UI
function renderStories() {
  if (!state.stories.length) {
    storiesList.innerHTML =
      '<div class="story-card"><div class="header"><div>No stories yet.</div></div></div>';
    return;
  }
  storiesList.innerHTML = "";
  state.stories.forEach((story) => {
    const wrap = document.createElement("div");
    wrap.className = "story-card";
    const taskRows = (story.tasks || [])
      .map((t) => {
        const assignee = state.employees.find((e) => e.id === t.assigneeId);
        const deps = (t.dependencies || [])
          .map((depId) => {
            const dep = story.tasks.find((tsk) => tsk.id === depId);
            return dep ? dep.title : "";
          })
          .filter(Boolean);

        let depDisplay;
        if (deps.length === 0) {
          depDisplay = '<span class="chip off">None</span>';
        } else if (deps.length === 1) {
          depDisplay = `<span class="chip dependency" title="${escapeHtml(
            deps[0]
          )}">${escapeHtml(
            deps[0].length > 20 ? deps[0].substring(0, 20) + "..." : deps[0]
          )}</span>`;
        } else {
          const firstDep =
            deps[0].length > 15 ? deps[0].substring(0, 15) + "..." : deps[0];
          depDisplay = `<span class="chip dependency" title="${escapeHtml(
            deps.join(", ")
          )}">${escapeHtml(firstDep)} +${deps.length - 1}</span>`;
        }
        const assigneeSelect = state.employees.length
          ? `<select class="inline-select" data-action="change-assignee" data-story-id="${
              story.id
            }" data-task-id="${t.id}">
               <option value=""${
                 t.assigneeId ? "" : " selected"
               }>Unassigned</option>
               ${state.employees
                 .map(
                   (e) =>
                     `<option value="${e.id}"${
                       t.assigneeId === e.id ? " selected" : ""
                     }>${escapeHtml(e.name)}</option>`
                 )
                 .join("")}
             </select>`
          : '<span class="chip off">Unassigned</span>';
        return `
        <tr>
          <td>${escapeHtml(t.title)}</td>
          <td>${assigneeSelect}</td>
          <td><input type="text" class="estimate-input" data-action="change-estimate" data-story-id="${
            story.id
          }" data-task-id="${t.id}" value="${minutesToJiraSyntax(
          t.estimateMinutes
        )}" placeholder="e.g., 2w 1d 5h 4m"></td>
          <td>${depDisplay}</td>
          <td>
            <div style="display:flex;gap:6px;">
              <button class="btn small" data-action="edit-task" data-story-id="${
                story.id
              }" data-task-id="${t.id}">Edit</button>
              <button class="btn small danger" data-action="remove-task" data-story-id="${
                story.id
              }" data-task-id="${t.id}">Remove</button>
            </div>
          </td>
        </tr>`;
      })
      .join("");
    const tasksTable =
      story.tasks && story.tasks.length
        ? `
        <table class="table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Assignee</th>
              <th>Estimate</th>
              <th>Dependencies</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${taskRows}
          </tbody>
        </table>`
        : '<span class="chip off">No tasks</span>';
    wrap.innerHTML = `
      <div class="header" data-story-id="${story.id}">
        <strong>${story.title}</strong>
        <div class="actions">
          <button class="btn small" data-action="open-task-modal" data-id="${story.id}">Add Task</button>
          <button class="btn small danger" data-action="remove-story" data-id="${story.id}">Remove Story</button>
        </div>
      </div>
      <div class="tasks" id="tasks-${story.id}">
        ${tasksTable}
      </div>
    `;
    storiesList.appendChild(wrap);
  });
}

function openTasksForStory(storyId) {
  const el = document.getElementById(`tasks-${storyId}`);
  if (el) el.classList.add("active");
}

function renderDependenciesChecklist(
  storyId,
  currentTaskId = null,
  selectedDeps = []
) {
  const story = state.stories.find((s) => s.id === storyId);
  if (!story || !taskModalDepList) return;
  const query = "";
  const list = (story.tasks || [])
    .filter((t) => t.id !== currentTaskId)
    .filter((t) => !query || t.title.toLowerCase().includes(query));
  if (!list.length) {
    taskModalDepList.innerHTML = '<div class="empty">No tasks found</div>';
    return;
  }
  const rows = list
    .map((t) => {
      const checked = selectedDeps.includes(t.id) ? " checked" : "";
      return `<div class="item-row">
        <input type="checkbox" class="dep-checkbox" data-dep-id="${
          t.id
        }"${checked}>
        <div class="title">${escapeHtml(t.title)}</div>
      </div>`;
    })
    .join("");
  taskModalDepList.innerHTML = rows;
}

function openTaskModal(storyId) {
  const options = state.employees
    .map((e) => `<option value="${e.id}">${escapeHtml(e.name)}</option>`)
    .join("");
  taskModalAssignee.innerHTML = options;
  if (!state.employees.length) taskModalAssignee.setAttribute("disabled", "");
  else taskModalAssignee.removeAttribute("disabled");

  renderDependenciesChecklist(storyId);

  taskModalStoryId.value = String(storyId);
  taskModalTaskId.value = "";
  taskModalTitleInput.value = "";
  taskModalEstimateText.value = "";
  taskModalSubmitBtn.textContent = "Add Task";
  taskModal.classList.add("active");
  taskModal.setAttribute("aria-hidden", "false");
  setTimeout(() => taskModalTitleInput.focus(), 0);
}

function openEditTaskModal(storyId, taskId) {
  const story = state.stories.find((s) => s.id === storyId);
  if (!story) return;
  const task = (story.tasks || []).find((t) => t.id === taskId);
  if (!task) return;
  const options = state.employees
    .map((e) => `<option value="${e.id}">${escapeHtml(e.name)}</option>`)
    .join("");
  taskModalAssignee.innerHTML = options;
  if (!state.employees.length) taskModalAssignee.setAttribute("disabled", "");
  else taskModalAssignee.removeAttribute("disabled");

  renderDependenciesChecklist(storyId, taskId, task.dependencies || []);

  taskModalStoryId.value = String(storyId);
  taskModalTaskId.value = String(taskId);
  taskModalTitleInput.value = task.title;
  taskModalEstimateText.value = minutesToJiraSyntax(task.estimateMinutes);
  taskModalAssignee.value = task.assigneeId ? String(task.assigneeId) : "";
  taskModalSubmitBtn.textContent = "Save Changes";
  taskModal.classList.add("active");
  taskModal.setAttribute("aria-hidden", "false");
}

function closeTaskModal() {
  taskModal.classList.remove("active");
  taskModal.setAttribute("aria-hidden", "true");
}

document.addEventListener("click", (e) => {
  const target = e.target;
  if (!(target instanceof HTMLElement)) return;
  const action = target.getAttribute("data-action");
  if (action === "open-task-modal") {
    const id = Number(target.getAttribute("data-id"));
    openTaskModal(id);
  } else if (action === "close-modal") {
    closeTaskModal();
  } else if (action === "edit-task") {
    const storyId = Number(target.getAttribute("data-story-id"));
    const taskId = Number(target.getAttribute("data-task-id"));
    openEditTaskModal(storyId, taskId);
  }
});

closeTaskModalBtn?.addEventListener("click", closeTaskModal);

taskModalForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const storyId = Number(taskModalStoryId.value);
  const story = state.stories.find((s) => s.id === storyId);
  if (!story) return;
  const title = taskModalTitleInput.value.trim();
  const estimateText = String(taskModalEstimateText.value || "").trim();
  const assigneeId = Number(taskModalAssignee.value) || null;
  const deps = Array.from(
    taskModalDepList?.querySelectorAll(".dep-checkbox") || []
  )
    .filter((el) => el.checked)
    .map((el) => Number(el.getAttribute("data-dep-id")));
  if (!title) return;
  const minutes = parseJiraEstimateToMinutes(estimateText);
  if (!Number.isFinite(minutes) || minutes < 0) return;
  const existingTaskId = Number(taskModalTaskId.value) || null;
  if (existingTaskId) {
    const t = (story.tasks || []).find((tsk) => tsk.id === existingTaskId);
    if (t) {
      t.title = title;
      t.estimateMinutes = minutes;
      t.assigneeId = assigneeId;
      t.dependencies = deps;
    }
  } else {
    const task = {
      id: uid("task"),
      storyId,
      title,
      estimateMinutes: minutes,
      assigneeId,
      dependencies: deps,
    };
    if (!story.tasks) story.tasks = [];
    story.tasks.push(task);
  }
  save();
  closeTaskModal();
  renderStories();
  openTasksForStory(storyId);
});

storiesList.addEventListener("click", (e) => {
  const target = e.target;
  if (!(target instanceof HTMLElement)) return;
  const action = target.getAttribute("data-action");
  if (!action) return;
  if (action === "change-assignee" || action === "change-estimate") return; // handled on change
  if (action === "remove-story") {
    const id = Number(target.getAttribute("data-id"));
    if (!isPendingConfirmation(action, id)) {
      // First click - set confirmation state
      setPendingConfirmation(action, id, target);
      return;
    }

    // Second click - confirm deletion
    resetConfirmation(action, id, target);
    state.stories = state.stories.filter((s) => s.id !== id);
    save();
    renderStories();
  } else if (action === "remove-task") {
    const storyId = Number(target.getAttribute("data-story-id"));
    const taskId = Number(target.getAttribute("data-task-id"));

    if (!isPendingConfirmation(action, taskId)) {
      // First click - set confirmation state
      setPendingConfirmation(action, taskId, target);
      return;
    }

    // Second click - confirm deletion
    resetConfirmation(action, taskId, target);
    const story = state.stories.find((s) => s.id === storyId);
    if (!story) return;
    story.tasks = (story.tasks || []).filter((t) => t.id !== taskId);
    story.tasks.forEach((t) => {
      t.dependencies = (t.dependencies || []).filter(
        (depId) => depId !== taskId
      );
    });
    save();
    renderStories();
    openTasksForStory(storyId);
  }
});

// Inline change: assignee select and estimate input inside story tasks table
storiesList.addEventListener("change", (e) => {
  const target = e.target;
  if (
    !(target instanceof HTMLSelectElement || target instanceof HTMLInputElement)
  )
    return;
  const action = target.getAttribute("data-action");
  const storyId = Number(target.getAttribute("data-story-id"));
  const taskId = Number(target.getAttribute("data-task-id"));
  const story = state.stories.find((s) => s.id === storyId);
  if (!story) return;
  const task = (story.tasks || []).find((t) => t.id === taskId);
  if (!task) return;

  if (action === "change-assignee") {
    const assigneeId = target.value ? Number(target.value) : null;
    task.assigneeId = assigneeId;
  } else if (action === "change-estimate") {
    const estimateText = target.value.trim();
    const minutes = parseJiraEstimateToMinutes(estimateText);
    if (!Number.isFinite(minutes) || minutes < 0) {
      alert("Invalid estimate format. Use: e.g., 2w 1d 5h 4m or 3h or 90m");
      target.value = minutesToJiraSyntax(task.estimateMinutes); // Revert to previous value
      return;
    }
    task.estimateMinutes = minutes;
  }

  save();
  renderStories();
  openTasksForStory(storyId);
  renderSchedule();
});

storyForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = storyTitleInput.value.trim();
  if (!title) return;
  const story = { id: uid("story"), title, tasks: [] };
  const defaultTaskTitles = [
    "Frontend Implementation",
    "Backend Implementation",
    "Test Cases",
    "Test Execution",
    "Frontend Review",
    "Backend Review",
    "UI/UX Design",
  ];
  story.tasks = defaultTaskTitles.map((tTitle) => ({
    id: uid("task"),
    storyId: story.id,
    title: tTitle,
    estimateMinutes: 0,
    assigneeId: null,
    dependencies: [],
  }));
  // Set default dependency: Backend Review depends on Backend Implementation
  const frontendImpl = story.tasks.find(
    (t) => t.title === "Frontend Implementation"
  );
  const frontendReview = story.tasks.find((t) => t.title === "Frontend Review");
  if (frontendImpl && frontendReview) {
    frontendReview.dependencies = [frontendImpl.id];
  }
  const backendImpl = story.tasks.find(
    (t) => t.title === "Backend Implementation"
  );
  const backendReview = story.tasks.find((t) => t.title === "Backend Review");
  if (backendImpl && backendReview) {
    backendReview.dependencies = [backendImpl.id];
  }

  const taskExecutionDependsOn = story.tasks.filter((t) =>
    [
      "Test Cases",
      "Backend Implementation",
      "Backend Review",
      "Frontend Implementation",
      "Frontend Review",
    ].includes(t.title)
  );

  const testExecution = story.tasks.find((t) => t.title === "Test Execution");
  if (testExecution && taskExecutionDependsOn.length > 0) {
    testExecution.dependencies = taskExecutionDependsOn.map((t) => t.id);
  }
  state.stories.push(story);
  storyTitleInput.value = "";
  storyForm.style.display = "none";
  showStoryFormBtn.style.display = "block";
  save();
  renderStories();
});

// Sprint form
sprintForm.addEventListener("submit", (e) => {
  e.preventDefault();
  state.sprint.startDateISO = sprintStartInput.value || todayISO();
  state.sprint.weeks = Number(sprintWeeksInput.value) || 2;
  state.sprint.extensionDays = Number(sprintExtensionDaysInput.value) || 0;
  state.sprint.defaultDailyHours = Number(defaultDailyHoursInput.value) || 7;
  state.sprint.startTime = sprintStartTimeInput.value || "09:00";
  state.sprint.workStartTime = workStartTimeInput.value || "09:00";
  state.sprint.workEndTime = workEndTimeInput.value || "16:00";
  save();
  hydrateForms();
});

resetAllBtn.addEventListener("click", () => {
  if (!confirm("Clear all data?")) return;
  localStorage.removeItem("sprintPlannerState");
  location.reload();
});

// Estimation conversion
function unitToMinutes(amount, unit) {
  const defaultHours = state.sprint.defaultDailyHours || 7;
  switch (unit) {
    case "m":
      return amount;
    case "h":
      return amount * 60;
    case "d":
      return amount * defaultHours * 60;
    case "w":
      return amount * 5 * defaultHours * 60;
    default:
      return amount * 60;
  }
}

// Jira-style estimate parsing: e.g., "2w 1d 5h 4m", case-insensitive, order-insensitive
function parseJiraEstimateToMinutes(input) {
  if (!input) return 0;
  const text = String(input).trim().toLowerCase();
  if (!text) return 0;
  const defaultHours = state.sprint.defaultDailyHours || 7;
  const weekMinutes = 5 * defaultHours * 60;
  const dayMinutes = defaultHours * 60;
  const hourMinutes = 60;
  const minuteMinutes = 1;
  let total = 0;
  const regex = /(\d+)\s*(w|d|h|m)/g;
  let match;
  while ((match = regex.exec(text))) {
    const qty = Number(match[1]);
    const unit = match[2];
    if (!Number.isFinite(qty)) continue;
    switch (unit) {
      case "w":
        total += qty * weekMinutes;
        break;
      case "d":
        total += qty * dayMinutes;
        break;
      case "h":
        total += qty * hourMinutes;
        break;
      case "m":
        total += qty * minuteMinutes;
        break;
    }
  }
  // If the whole string was a plain number, treat as hours for convenience
  if (total === 0) {
    const plain = Number(text);
    if (Number.isFinite(plain) && plain > 0) total = plain * hourMinutes;
  }
  return total;
}

// Format minutes into compact Jira-like string (weeks/days/hours/minutes)
function minutesToJiraSyntax(mins) {
  const defaultHours = state.sprint.defaultDailyHours || 7;
  const week = 5 * defaultHours * 60;
  const day = defaultHours * 60;
  let remaining = Math.max(0, Math.floor(mins || 0));
  const parts = [];
  const w = Math.floor(remaining / week);
  if (w) {
    parts.push(`${w}w`);
    remaining -= w * week;
  }
  const d = Math.floor(remaining / day);
  if (d) {
    parts.push(`${d}d`);
    remaining -= d * day;
  }
  const h = Math.floor(remaining / 60);
  if (h) {
    parts.push(`${h}h`);
    remaining -= h * 60;
  }
  const m = remaining;
  if (m) parts.push(`${m}m`);
  if (!parts.length) return "0m";
  return parts.join(" ");
}

function timeToMinutes(t) {
  if (!t) return 0;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}
function minutesToHHMM(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function dateWithMinutes(date, minutesOfDay) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setMinutes(minutesOfDay);
  return d;
}

function formatTime(date) {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}`;
}

function isSameDay(date1, date2) {
  return fmtISO(date1) === fmtISO(date2);
}

// Topological sort for tasks
function topologicalSort(tasks) {
  const graph = new Map();
  const inDegree = new Map();
  tasks.forEach((t) => {
    graph.set(t.id, []);
    inDegree.set(t.id, 0);
  });
  tasks.forEach((t) => {
    (t.dependencies || []).forEach((depId) => {
      if (tasks.find((task) => task.id === depId)) {
        graph.get(depId).push(t.id);
        inDegree.set(t.id, (inDegree.get(t.id) || 0) + 1);
      }
    });
  });
  const queue = tasks
    .filter((t) => (inDegree.get(t.id) || 0) === 0)
    .map((t) => t.id);
  const order = [];
  while (queue.length) {
    const curr = queue.shift();
    order.push(curr);
    graph.get(curr).forEach((neighbor) => {
      inDegree.set(neighbor, inDegree.get(neighbor) - 1);
      if (inDegree.get(neighbor) === 0) queue.push(neighbor);
    });
  }
  if (order.length !== tasks.length) {
    alert("Cycle detected in task dependencies! Scheduling may be invalid.");
    return tasks.map((t) => t.id);
  }
  return order;
}

// Scheduling
function schedule() {
  const dates = getSprintDates();
  const endDate = dates[dates.length - 1];

  const workStartMins = timeToMinutes(state.sprint.workStartTime || "09:00");
  const workEndMins = timeToMinutes(state.sprint.workEndTime || "16:00");
  const sprintStartMins = timeToMinutes(state.sprint.startTime || "09:00");

  const holidaySet = new Set(
    (state.sprint.officialHolidays || []).map((h) => h.dateISO)
  );

  const dayStartMin = new Map();
  const dayWindowMin = new Map();
  dates.forEach((d, idx) => {
    const iso = fmtISO(d);
    const start =
      idx === 0 ? Math.max(workStartMins, sprintStartMins) : workStartMins;
    const isHoliday = holidaySet.has(iso);
    const window = isHoliday ? 0 : Math.max(0, workEndMins - start);
    dayStartMin.set(iso, start);
    dayWindowMin.set(iso, window);
  });

  const availability = new Map();
  const allocations = new Map();
  const usedSoFar = new Map();

  state.employees.forEach((emp) => {
    const map = new Map();
    const allocMap = new Map();
    const usedMap = new Map();
    // Convert leave objects to date strings for the Set
    const leaveDates = (emp.leaves || []).map((leave) =>
      typeof leave === "string" ? leave : leave.date
    );
    const leaveSet = new Set(leaveDates);
    dates.forEach((d) => {
      const iso = fmtISO(d);
      const isOff = isWeekend(d) || leaveSet.has(iso) || holidaySet.has(iso);
      const windowCap = Math.min(
        dayWindowMin.get(iso) || 0,
        Number.isFinite(emp.dailyHours)
          ? emp.dailyHours * 60
          : state.sprint.defaultDailyHours * 60
      );
      map.set(iso, isOff ? 0 : windowCap);
      allocMap.set(iso, []);
      usedMap.set(iso, 0);
    });
    availability.set(emp.id, map);
    allocations.set(emp.id, allocMap);
    usedSoFar.set(emp.id, usedMap);
  });

  const tasks = [];
  state.stories.forEach((story) => {
    (story.tasks || []).forEach((t) => tasks.push(t));
  });
  const tasksByEmp = new Map();
  tasks.forEach((t) => {
    if (!t.assigneeId) return;
    if (!tasksByEmp.has(t.assigneeId)) tasksByEmp.set(t.assigneeId, []);
    tasksByEmp.get(t.assigneeId).push(t);
  });

  const taskDue = new Map();

  // First, schedule all tasks in dependency order
  const allTasks = [];
  state.stories.forEach((story) => {
    (story.tasks || []).forEach((t) => allTasks.push(t));
  });

  // Sort all tasks by dependencies (topological sort)
  const taskOrder = topologicalSort(allTasks);
  const sortedTasks = taskOrder
    .map((id) => allTasks.find((t) => t.id === id))
    .filter(Boolean);

  // Schedule tasks in dependency order
  sortedTasks.forEach((task) => {
    if (!task.assigneeId) return;

    const emp = state.employees.find((e) => e.id === task.assigneeId);
    if (!emp) return;

    const avail = availability.get(emp.id);
    const alloc = allocations.get(emp.id);
    const usedMap = usedSoFar.get(emp.id);
    // Convert leave objects to date strings for the Set
    const leaveDates = (emp.leaves || []).map((leave) =>
      typeof leave === "string" ? leave : leave.date
    );
    const leaveSet = new Set(leaveDates);

    // Find the earliest start time based on dependencies
    let earliestStart = parseISO(state.sprint.startDateISO);
    let dependencyEndTime = null;

    (task.dependencies || []).forEach((depId) => {
      const depDue = taskDue.get(depId);
      if (depDue && depDue > earliestStart) {
        earliestStart = new Date(depDue);
        dependencyEndTime = depDue;
      }
    });

    let remaining = task.estimateMinutes;
    let currentDate = new Date(earliestStart);

    // If we have a dependency that ends on the same day, we need to start after that time
    let startTimeOverride = null;
    if (dependencyEndTime && isSameDay(currentDate, dependencyEndTime)) {
      const depEndMinutes = timeToMinutes(formatTime(dependencyEndTime));
      // If dependency ends after work hours, start next day
      if (depEndMinutes >= workEndMins) {
        currentDate = addDays(currentDate, 1);
        startTimeOverride = null;
      } else {
        startTimeOverride = depEndMinutes;
      }
    }

    while (remaining > 0) {
      const iso = fmtISO(currentDate);
      const isOff =
        isWeekend(currentDate) || leaveSet.has(iso) || holidaySet.has(iso);

      if (!isOff && currentDate >= parseISO(state.sprint.startDateISO)) {
        const isInSprint = currentDate <= endDate;
        let startMin = isInSprint
          ? dayStartMin.get(iso) || workStartMins
          : workStartMins;

        // If we have a dependency that ended on this day, start after that time
        if (startTimeOverride && isSameDay(currentDate, dependencyEndTime)) {
          startMin = Math.max(startMin, startTimeOverride);
          startTimeOverride = null; // Only apply once
        }

        // Calculate available time for this day
        const workEndMin = workEndMins;
        const availableUntilEnd = workEndMin - startMin;
        const usedToday = usedMap.get(iso) || 0;
        const remainingToday = Math.max(0, availableUntilEnd - usedToday);

        if (remainingToday <= 0) {
          currentDate = addDays(currentDate, 1);
          continue;
        }

        // Only use the minimum of: remaining task time, remaining today, and employee's daily capacity
        const empDailyCap = isInSprint
          ? avail.get(iso) || 0
          : emp.dailyHours * 60;
        const maxPossibleToday = Math.min(
          remainingToday,
          empDailyCap - usedToday
        );
        const used = Math.min(maxPossibleToday, remaining);

        if (used > 0) {
          const segStart = startMin + usedToday;
          const segEnd = segStart + used;
          usedMap.set(iso, usedToday + used);
          alloc.get(iso).push({
            taskId: task.id,
            minutes: used,
            startMin: segStart,
            endMin: segEnd,
          });
          remaining -= used;
          if (remaining === 0) {
            taskDue.set(task.id, dateWithMinutes(currentDate, segEnd));
          }
        }
      }
      currentDate = addDays(currentDate, 1);
      if (task.estimateMinutes - remaining > 365 * 24 * 60) break;
    }
  });

  const storyDue = new Map();
  state.stories.forEach((story) => {
    let latest = null;
    (story.tasks || []).forEach((t) => {
      const d = taskDue.get(t.id) || null;
      if (d && (!latest || d > latest)) latest = d;
    });
    if (latest) storyDue.set(story.id, latest);
  });

  return { dates, allocations, taskDue, storyDue, holidaySet };
}

// Rendering calendar
function renderSchedule() {
  const { dates, allocations, taskDue, storyDue, holidaySet } = schedule();
  const dayCol = (
    getComputedStyle(document.documentElement).getPropertyValue(
      "--schedule-day-col"
    ) || "160px"
  ).trim();
  const columns = `200px ${dates.map(() => dayCol).join(" ")}`;
  const grid = document.createElement("div");
  grid.className = "calendar";
  grid.style.gridTemplateColumns = columns;

  const pushCell = (html, className = "cell") => {
    const div = document.createElement("div");
    div.className = className;
    div.innerHTML = html;
    grid.appendChild(div);
  };

  pushCell("<div>Employee</div>", "cell header emp");
  dates.forEach((d) => {
    const iso = fmtISO(d);
    const off = isWeekend(d);
    const isHol = holidaySet.has(iso);
    const label = isHol ? "Holiday" : off ? "Off" : "";
    pushCell(
      `<div>${humanDate(d)}${label ? ` • ${label}` : ""}</div>`,
      `cell header ${off ? "off" : ""} ${isHol ? "holiday" : ""}`
    );
  });

  state.employees.forEach((emp) => {
    pushCell(
      `<div>${emp.name}<div class="meta">${emp.dailyHours}h/day</div></div>`,
      "cell emp"
    );
    const avail = allocations.get(emp.id);
    // Convert leave objects to date strings for the Set
    const leaveDates = (emp.leaves || []).map((leave) =>
      typeof leave === "string" ? leave : leave.date
    );
    const leaveSet = new Set(leaveDates);

    dates.forEach((d) => {
      const iso = fmtISO(d);
      const isOff = isWeekend(d);
      const isLeave = leaveSet.has(iso);
      const isHol = holidaySet.has(iso);
      const items = avail ? avail.get(iso) || [] : [];
      if (isOff || isLeave || isHol) {
        const chips = [
          isHol ? '<span class="chip warn">Holiday</span>' : "",
          isLeave ? '<span class="chip">Leave</span>' : "",
          !isHol && !isLeave && isOff
            ? '<span class="chip off">Off</span>'
            : "",
        ]
          .filter(Boolean)
          .join(" ");
        pushCell(
          `<div class="chips">${chips}</div>`,
          `cell ${isHol ? "holiday" : isLeave ? "leave" : "off"}`
        );
      } else if (!items.length) {
        pushCell('<div class="meta">Free</div>', "cell");
      } else {
        const lines = items
          .map((it) => {
            const task = findTaskById(it.taskId);
            const story = task
              ? state.stories.find((s) => s.id === task.storyId)
              : null;
            const displayTitle =
              task && story
                ? `${escapeHtml(story.title)}: ${escapeHtml(task.title)}`
                : escapeHtml(task?.title || "Task");
            const time = `<span class="time">${minutesToHHMM(
              it.startMin
            )}–${minutesToHHMM(it.endMin)}</span>`;
            return `<div class="taskline">${time}<strong>${displayTitle}</strong><span class="mins">${minutesToHuman(
              it.minutes
            )}</span></div>`;
          })
          .join("");
        pushCell(`<div class="alloc">${lines}</div>`, "cell");
      }
    });
  });

  scheduleRoot.innerHTML = "";
  scheduleRoot.appendChild(grid);

  renderTaskSummary(taskDue, dates[dates.length - 1]);
  renderStorySummary(storyDue, dates[dates.length - 1]);
  try {
    renderTimeline();
  } catch (e) {}
}

function renderTaskSummary(taskDue, sprintEnd) {
  const sprintEndDateTime = dateWithMinutes(
    sprintEnd,
    timeToMinutes(state.sprint.workEndTime || "16:00")
  );
  const table = document.createElement("table");
  table.className = "table";
  table.innerHTML = `
    <thead>
      <tr>
        <th>Story</th>
        <th>Task</th>
        <th>Assignee</th>
        <th>Estimate</th>
        <th>Dependencies</th>
        <th>Due</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;
  const tbody = table.querySelector("tbody");
  state.stories.forEach((story) => {
    (story.tasks || []).forEach((t) => {
      const due = taskDue.get(t.id);
      const assignee = state.employees.find((e) => e.id === t.assigneeId);
      const deps = (t.dependencies || [])
        .map((depId) => {
          const dep = story.tasks.find((tsk) => tsk.id === depId);
          return dep ? dep.title : "";
        })
        .filter(Boolean);

      let depDisplay;
      if (deps.length === 0) {
        depDisplay = '<span class="chip off">None</span>';
      } else if (deps.length === 1) {
        depDisplay = `<span class="chip dependency" title="${escapeHtml(
          deps[0]
        )}">${escapeHtml(
          deps[0].length > 20 ? deps[0].substring(0, 20) + "..." : deps[0]
        )}</span>`;
      } else {
        const firstDep =
          deps[0].length > 15 ? deps[0].substring(0, 15) + "..." : deps[0];
        depDisplay = `<span class="chip dependency" title="${escapeHtml(
          deps.join(", ")
        )}">${escapeHtml(firstDep)} +${deps.length - 1}</span>`;
      }
      const tr = document.createElement("tr");
      const within =
        due && isWithinSprintBusiness(due, sprintEndDateTime, assignee);
      const leavesCount =
        assignee && due
          ? countEmployeeLeavesInRange(
              assignee,
              parseISO(state.sprint.startDateISO),
              due
            )
          : 0;
      const dueText = due ? `${humanDateTime(due)}` : "—";
      tr.innerHTML = `
        <td>${escapeHtml(story.title)}</td>
        <td>${escapeHtml(t.title)}</td>
        <td>${
          assignee
            ? `<span class="chip assignee">${escapeHtml(assignee.name)}</span>`
            : "—"
        }</td>
        <td><span class="chip estimate">${minutesToHuman(
          t.estimateMinutes
        )}</span></td>
        <td>${depDisplay || "—"}</td>
        <td >${dueText}</td>
        <td class="${within ? "status-ok" : "status-bad"}">${
        due ? (within ? "Within Sprint" : "After Sprint") : "—"
      }</td>
      `;
      tbody.appendChild(tr);
    });
  });
  taskSummaryRoot.innerHTML = "";
  if (state.stories.flatMap((s) => s.tasks || []).length === 0) {
    taskSummaryRoot.innerHTML = '<div class="meta">No tasks scheduled.</div>';
  } else {
    taskSummaryRoot.appendChild(table);
  }
}

function renderStorySummary(storyDue, sprintEnd) {
  const sprintEndDateTime = dateWithMinutes(
    sprintEnd,
    timeToMinutes(state.sprint.workEndTime || "16:00")
  );
  const table = document.createElement("table");
  table.className = "table";
  table.innerHTML = `
    <thead>
      <tr>
        <th>Story</th>
        <th>Due</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;
  const tbody = table.querySelector("tbody");
  state.stories.forEach((story) => {
    const due = storyDue.get(story.id);
    const assignees = new Set(
      (story.tasks || []).map((t) => t.assigneeId).filter(Boolean)
    );
    const within =
      due &&
      Array.from(assignees).every((id) =>
        isWithinSprintBusiness(
          due,
          sprintEndDateTime,
          state.employees.find((e) => e.id === id)
        )
      );
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(story.title)}</td>
      <td>${due ? humanDateTime(due) : "—"}</td>
      <td class="${within ? "status-ok" : "status-bad"}">${
      due ? (within ? "Within Sprint" : "After Sprint") : "—"
    }</td>
    `;
    tbody.appendChild(tr);
  });
  storySummaryRoot.innerHTML = "";
  if (state.stories.length === 0) {
    storySummaryRoot.innerHTML =
      '<div class="meta">No stories scheduled.</div>';
  } else {
    storySummaryRoot.appendChild(table);
  }
}

function isWithinSprintBusiness(due, sprintEndDateTime, employee) {
  if (!due) return false;
  if (due <= sprintEndDateTime) return true;
  return false;
}

function countEmployeeLeavesInRange(employee, startDate, endDateInclusive) {
  if (!employee || !employee.leaves || !employee.leaves.length) return 0;
  const startISO = fmtISO(startDate);
  const endISO = fmtISO(endDateInclusive);
  let count = 0;
  for (const leave of employee.leaves) {
    const leaveDate = typeof leave === "string" ? leave : leave.date;
    if (leaveDate >= startISO && leaveDate <= endISO) count++;
  }
  return count;
}

function findTaskById(taskId) {
  for (const story of state.stories) {
    for (const t of story.tasks || []) if (t.id === taskId) return t;
  }
  return null;
}

function escapeHtml(str) {
  return String(str).replace(
    /[&<>"']/g,
    (s) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        s
      ])
  );
}

computeBtn.addEventListener("click", renderSchedule);

// Timeline rendering
function renderTimeline() {
  const { dates, allocations, holidaySet } = schedule();
  const zoomPxPerHour = Number(timelineZoomInput?.value) || 60;
  if (timelineZoomValue) timelineZoomValue.textContent = String(zoomPxPerHour);

  const styles = getComputedStyle(document.documentElement);
  const bg = styles.getPropertyValue("--surface-2").trim() || "#0b1020";
  const gridOff = "#1f2937";
  const labelText = styles.getPropertyValue("--muted").trim() || "#9ca3af";
  const rowText = styles.getPropertyValue("--text").trim() || "#e5e7eb";
  const barFill = styles.getPropertyValue("--primary").trim() || "#3b82f6";
  const barStroke = "#1e3a8a";

  const rows = state.employees.map((e) => e.name);
  const segments = [];
  const workStartMins = timeToMinutes(state.sprint.workStartTime || "09:00");
  const workEndMins = timeToMinutes(state.sprint.workEndTime || "16:00");

  const sprintStart = parseISO(state.sprint.startDateISO);
  const origin = new Date(sprintStart);
  const minutesBetween = (d1, d2) => Math.floor((d2 - d1) / 60000);
  const pxPerMinute = zoomPxPerHour / 60;

  state.employees.forEach((emp, rowIdx) => {
    const empAlloc = allocations.get(emp.id);
    dates.forEach((d) => {
      const iso = fmtISO(d);
      const items = empAlloc ? empAlloc.get(iso) || [] : [];
      items.forEach((it) => {
        const startDateTime = dateWithMinutes(d, it.startMin);
        const endDateTime = dateWithMinutes(d, it.endMin);
        const task = findTaskById(it.taskId);
        segments.push({
          row: rowIdx,
          label: task ? task.title : "Task",
          start: startDateTime,
          end: endDateTime,
        });
      });
    });
  });

  const rowHeight = 32;
  const rowGap = 8;
  const leftPadding = 140;
  const topPadding = 28;
  const headerHeight = 24;

  const lastDay = dates[dates.length - 1];
  const lastEnd = dateWithMinutes(lastDay, workEndMins);
  const totalMinutes = Math.max(60, minutesBetween(origin, lastEnd));
  const width = leftPadding + Math.ceil(totalMinutes * pxPerMinute) + 40;
  const height =
    topPadding + headerHeight + rows.length * (rowHeight + rowGap) + 20;

  const dpr = window.devicePixelRatio || 1;
  if (timelineCanvas) {
    timelineCanvas.width = Math.floor(width * dpr);
    timelineCanvas.height = Math.floor(height * dpr);
    timelineCanvas.style.width = `${width}px`;
    timelineCanvas.style.height = `${height}px`;
    const ctx = timelineCanvas.getContext("2d");
    ctx.scale(dpr, dpr);

    ctx.fillStyle = bg || "#0b1020";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = labelText;
    ctx.font = "12px sans-serif";
    ctx.textBaseline = "middle";

    const dayWidth = (workEndMins - workStartMins) * pxPerMinute;
    let xCursor = leftPadding;
    dates.forEach((d) => {
      const iso = fmtISO(d);
      const isOff = isWeekend(d);
      const isHol = holidaySet.has(iso);
      ctx.fillStyle = isHol ? "#201010" : isOff ? "#0c1020" : bg;
      ctx.fillRect(xCursor, topPadding, dayWidth, height - topPadding - 10);
      ctx.fillStyle = labelText;
      ctx.fillText(humanDate(d), xCursor + 4, 14);
      if (isHol) {
        ctx.fillStyle = "#fecaca";
        ctx.fillText("Holiday", xCursor + 4, 26);
      }
      ctx.strokeStyle = gridOff;
      ctx.lineWidth = 1;
      for (let m = workStartMins; m <= workEndMins; m += 60) {
        const x = xCursor + (m - workStartMins) * pxPerMinute;
        ctx.beginPath();
        ctx.moveTo(x, topPadding);
        ctx.lineTo(x, height - 10);
        ctx.stroke();
        const hh = String(Math.floor(m / 60)).padStart(2, "0");
        ctx.fillStyle = labelText;
        ctx.fillText(`${hh}:00`, x + 2, topPadding - 10);
      }
      xCursor += dayWidth;
    });

    ctx.fillStyle = rowText;
    ctx.font = "13px sans-serif";
    rows.forEach((name, idx) => {
      const y =
        topPadding + headerHeight + idx * (rowHeight + rowGap) + rowHeight / 2;
      ctx.fillText(name, 10, y);
    });

    segments.forEach((seg) => {
      const y = topPadding + headerHeight + seg.row * (rowHeight + rowGap);
      const xStart =
        leftPadding +
        minutesBetween(origin, seg.start) * pxPerMinute -
        minutesBetween(
          origin,
          dateWithMinutes(parseISO(state.sprint.startDateISO), workStartMins)
        ) *
          pxPerMinute;
      const xEnd =
        leftPadding +
        minutesBetween(origin, seg.end) * pxPerMinute -
        minutesBetween(
          origin,
          dateWithMinutes(parseISO(state.sprint.startDateISO), workStartMins)
        ) *
          pxPerMinute;
      const w = Math.max(2, xEnd - xStart);

      ctx.fillStyle = barFill;
      ctx.strokeStyle = barStroke;
      ctx.lineWidth = 1;
      ctx.fillRect(xStart, y + 6, w, rowHeight - 12);
      ctx.strokeRect(xStart, y + 6, w, rowHeight - 12);

      ctx.save();
      ctx.beginPath();
      ctx.rect(xStart + 2, y + 8, w - 4, rowHeight - 16);
      ctx.clip();
      ctx.fillStyle = "#ffffff";
      ctx.font = "12px sans-serif";
      ctx.fillText(seg.label, xStart + 6, y + rowHeight / 2 + 2);
      ctx.restore();
    });
  }
}

renderTimelineBtn?.addEventListener("click", renderTimeline);
timelineZoomInput?.addEventListener("input", () => {
  if (timelineZoomValue)
    timelineZoomValue.textContent = String(
      Number(timelineZoomInput.value) || 60
    );
  renderTimeline();
});

downloadTimelinePngBtn?.addEventListener("click", () => {
  renderTimeline();
  if (timelineCanvas) {
    const url = timelineCanvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "sprint-timeline.png";
    a.click();
  }
});

printTimelineBtn?.addEventListener("click", () => {
  renderTimeline();
  window.print();
});

// Init
load();
if (!state.sprint.startDateISO) state.sprint.startDateISO = todayISO();
hydrateForms();
renderEmployees();
renderStories();
renderSchedule();
renderTimeline();

document.addEventListener("click", (e) => {
  const target = e.target;
  if (!(target instanceof HTMLElement)) return;
  const header = target.closest(".story-card .header");
  if (!header || !header.hasAttribute("data-story-id")) return;
  if (target.closest(".actions")) return;
  const id = Number(header.getAttribute("data-story-id"));
  const tasksDiv = document.getElementById(`tasks-${id}`);
  if (!tasksDiv) return;
  const isActive = tasksDiv.classList.contains("active");
  if (isActive) {
    tasksDiv.classList.remove("active");
  } else {
    document.querySelectorAll(".story-card .tasks.active").forEach((el) => {
      if (el !== tasksDiv) el.classList.remove("active");
    });
    tasksDiv.classList.add("active");
  }
});

function disableWeekendSelection(input) {
  input.addEventListener("change", (e) => {
    const selectedDate = parseISO(e.target.value);
    if (isWeekend(selectedDate)) {
      alert("Cannot select Friday or Saturday.");
      e.target.value = "";
    }
  });
}

disableWeekendSelection(officialHolidayDateInput);
state.employees.forEach((emp) => {
  const leaveInput = document.getElementById(`leaveDate-${emp.id}`);
  if (leaveInput) disableWeekendSelection(leaveInput);
});

const exportPdfBtn = document.getElementById("exportPdfBtn");
exportPdfBtn?.addEventListener("click", async () => {
  try {
    exportPdfBtn.disabled = true;
    exportPdfBtn.textContent = "Generating PDF...";

    // Create a temporary container for high-res rendering
    const tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.left = "-9999px";
    tempContainer.style.width = "1000px"; // Reduced width to fit single page
    tempContainer.style.backgroundColor = "transparent"; // Avoid white overlays
    tempContainer.style.padding = "10px";
    tempContainer.style.boxSizing = "border-box";
    document.body.appendChild(tempContainer);

    // Generate enhanced PDF content with a full-width table
    tempContainer.innerHTML = createEnhancedPdfContent();
    applyEnhancedPdfStyles(tempContainer);

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    // Calculate scaling for high resolution
    const pdfWidth = doc.internal.pageSize.getWidth() - 20; // Margin of 10mm on each side
    const contentWidth = tempContainer.offsetWidth;
    const scale = (pdfWidth / contentWidth) * 2; // Adjusted for better clarity

    // Generate high-resolution canvas
    const canvas = await html2canvas(tempContainer, {
      scale: scale,
      logging: false,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#FFFFFF",
      scrollX: 0,
      scrollY: 0,
      windowWidth: tempContainer.scrollWidth,
      windowHeight: tempContainer.scrollHeight,
    });

    // Add image to PDF with optimal dimensions
    const imgData = canvas.toDataURL("image/jpeg", 0.95); // High-quality JPEG
    const imgProps = doc.getImageProperties(imgData);
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    // Handle multi-page PDF if content is too long
    let currentHeight = pdfHeight;
    let yPosition = 10;

    if (currentHeight > doc.internal.pageSize.getHeight() - 20) {
      // Split content across pages
      const pageHeight = doc.internal.pageSize.getHeight() - 20;
      let yOffset = 0;

      while (yOffset < imgProps.height) {
        doc.addImage(
          imgData,
          "JPEG",
          10,
          yPosition,
          pdfWidth,
          Math.min(
            pageHeight,
            (imgProps.height - yOffset) * (pdfWidth / imgProps.width)
          ),
          undefined,
          "FAST"
        );
        yOffset += pageHeight * (imgProps.width / pdfWidth);
        if (yOffset < imgProps.height) {
          doc.addPage();
          yPosition = 10;
        }
      }
    } else {
      doc.addImage(
        imgData,
        "JPEG",
        10,
        yPosition,
        pdfWidth,
        pdfHeight,
        undefined,
        "FAST"
      );
    }

    // Save the PDF
    const startDate = parseISO(state.sprint.startDateISO);
    const endDate = getSprintEndDate();
    doc.save(`Sprint_Schedule_${fmtISO(startDate)}_to_${fmtISO(endDate)}.pdf`);
  } catch (error) {
    console.error("PDF Export Error:", error);
    alert("Failed to generate PDF. Please check console for details.");
  } finally {
    // Clean up
    const tempContainer = document.querySelector('div[style*="-9999px"]');
    if (tempContainer) document.body.removeChild(tempContainer);
    exportPdfBtn.disabled = false;
    exportPdfBtn.textContent = "Export PDF";
  }
});

function createEnhancedPdfContent() {
  const startDate = parseISO(state.sprint.startDateISO);
  const endDate = getSprintEndDate();
  const { dates, allocations, holidaySet } = schedule();

  // Generate table rows for employees and their tasks
  let tableRows = "";
  state.employees.forEach((emp) => {
    const leaveDates = (emp.leaves || []).map((leave) =>
      typeof leave === "string" ? leave : leave.date
    );
    const leaveSet = new Set(leaveDates);
    let row = `<tr><td style="font-weight: bold;">${escapeHtml(emp.name)}</td>`;

    dates.forEach((d) => {
      const iso = fmtISO(d);
      const isOff = isWeekend(d);
      const isLeave = leaveSet.has(iso);
      const isHol = holidaySet.has(iso);
      const items = allocations.get(emp.id)?.get(iso) || [];

      let cellContent = "";
      if (isOff || isLeave || isHol) {
        cellContent = isHol ? "Holiday" : isLeave ? "Leave" : "Off";
      } else if (items.length) {
        cellContent = items
          .map((it) => {
            const task = findTaskById(it.taskId);
            if (!task) {
              // Fallback if task is not found
              return `Unknown Task (${minutesToHuman(it.minutes)})`;
            }
            const story = state.stories.find((s) => s.id === task.storyId);
            const displayTitle =
              task && story
                ? `${escapeHtml(story.title)}: ${escapeHtml(task.title)}`
                : escapeHtml(task.title || "Task");
            return `${displayTitle} (${minutesToHuman(it.minutes)})`;
          })
          .join("<br>");
      } else {
        cellContent = "Free";
      }
      row += `<td>${cellContent}</td>`;
    });
    row += "</tr>";
    tableRows += row;
  });

  return `
    <div style="text-align: center; margin-bottom: 25px; padding: 10px;">
      <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: bold;">Sprint Schedule</h1>
      <h2 style="margin: 0 0 5px 0; font-size: 16px; color: #555;">
        ${humanDateOnly(startDate)} - ${humanDateOnly(endDate)}
      </h2>
      <p style="margin: 0; font-size: 12px; color: #777;">
        Generated: ${humanDateTime(new Date())}
      </p>
    </div>
    <div style="margin: 0 auto; width: 100%;">
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="min-width: 150px;">Employee</th>
            ${dates
              .map((d) => {
                const iso = fmtISO(d);
                const off = isWeekend(d);
                const isHol = holidaySet.has(iso);
                const label = isHol ? "Holiday" : off ? "Off" : "";
                return `<th>${humanDate(d)}${label ? ` • ${label}` : ""}</th>`;
              })
              .join("")}
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </div>
  `;
}

function applyEnhancedPdfStyles(container) {
  // Base styles
  container.style.fontFamily = "'Arial', sans-serif";
  container.style.padding = "20px";
  container.style.boxSizing = "border-box";

  // Table enhancements
  const table = container.querySelector("table");
  if (table) {
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.style.margin = "15px 0";
    table.style.fontSize = "10px";
    table.style.tableLayout = "auto"; // Allow columns to adjust dynamically

    // Header styles
    table.querySelectorAll("th").forEach((th) => {
      th.style.backgroundColor = "#f5f5f5";
      th.style.fontWeight = "bold";
      th.style.padding = "6px 4px";
      th.style.border = "1px solid #ddd";
      th.style.textAlign = "center";
      th.style.whiteSpace = "normal";
      th.style.wordWrap = "break-word";
      th.style.minWidth = "80px"; // Ensure columns have enough width
    });

    // Cell styles
    table.querySelectorAll("td").forEach((td) => {
      td.style.padding = "5px 4px";
      td.style.border = "1px solid #ddd";
      td.style.verticalAlign = "top";
      td.style.wordBreak = "break-word";
      td.style.textAlign = "left";
    });

    // Employee name column
    table.querySelectorAll("td:first-child").forEach((td) => {
      td.style.fontWeight = "bold";
      td.style.backgroundColor = "#f9f9f9";
    });

    // Highlight off/holiday/leave cells
    table.querySelectorAll("td").forEach((td) => {
      if (["Holiday", "Leave", "Off"].includes(td.textContent)) {
        td.style.backgroundColor = "#fff0f0";
        td.style.textAlign = "center";
      }
    });
  }

  // Hide interactive elements
  container
    .querySelectorAll("button, input, select, .btn, .actions")
    .forEach((el) => {
      el.style.display = "none";
    });

  // Ensure chips are styled for visibility
  container.querySelectorAll(".chip").forEach((chip) => {
    chip.style.display = "inline-block";
    chip.style.padding = "2px 6px";
    chip.style.borderRadius = "3px";
    chip.style.margin = "1px";
    chip.style.fontSize = "9px";
    chip.style.backgroundColor = "#e5e7eb";
  });
}
