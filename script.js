const subjectInput = document.getElementById("subjectInput");
const subjectList = document.getElementById("subjectList");
const subjectCount = document.getElementById("subjectCount");

const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const completedCount = document.getElementById("completedCount");

const timerDisplay = document.getElementById("timerDisplay");
const studyTime = document.getElementById("studyTime");

let subjects = JSON.parse(localStorage.getItem("subjects")) || [];
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

let timeLeft = Number(localStorage.getItem("timeLeft")) || 25 * 60;
let timerInterval = null;

document.getElementById("todayDate").textContent =
    new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });

function addSubject() {
    const name = subjectInput.value.trim();

    if (name === "") {
        alert("Please enter a subject name!");
        return;
    }

    subjects.push(name);
    subjectInput.value = "";
    renderSubjects();
}

function renderSubjects() 
 {
    subjectList.innerHTML = "";

    subjects.forEach((subject, index) => {
        const li = document.createElement("li");
        const span = document.createElement("span");
        span.textContent = subject;

        const button = document.createElement("button");
        button.textContent = "Delete";
        button.className = "delete-btn";

        button.onclick = () => {
            subjects.splice(index, 1);
            renderSubjects();
        };

        li.append(span, button);
        subjectList.appendChild(li);
    });

    subjectCount.textContent = subjects.length;
    localStorage.setItem("subjects", JSON.stringify(subjects));
}

function addTask() {
    const name = taskInput.value.trim();

    if (name === "") {
        alert("Please enter a task!");
        return;
    }

    tasks.push({
        name: name,
        completed: false
    });

    taskInput.value = "";
    renderTasks();
}

function renderTasks() {
    taskList.innerHTML = "";

    tasks.forEach((task, index) => {
        const li = document.createElement("li");

        if (task.completed) {
            li.classList.add("done");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.style.flex = "0 0 auto";
        checkbox.style.minWidth = "auto";
        checkbox.checked = task.completed;

        checkbox.onchange = () => {
            task.completed = checkbox.checked;
            renderTasks();
        };

        const span = document.createElement("span");
        span.textContent = task.name;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";

        deleteButton.onclick = () => {
            tasks.splice(index, 1);
            renderTasks();
        };

        li.append(checkbox, span, deleteButton);
        taskList.appendChild(li);
    });

    const completed = tasks.filter(task => task.completed).length;

    completedCount.textContent = completed;

    const percentage = tasks.length === 0
        ? 0
        : Math.round((completed / tasks.length) * 100);

    document.getElementById("progressText").textContent =
        percentage + "% completed";

    document.getElementById("progressBar").style.width =
        percentage + "%";
         localStorage.setItem("tasks", JSON.stringify(tasks));
}

document.getElementById("addSubjectBtn").onclick = addSubject;
document.getElementById("addTaskBtn").onclick = addTask;

subjectInput.addEventListener("keydown", event => {
    if (event.key === "Enter") addSubject();
});

taskInput.addEventListener("keydown", event => {
    if (event.key === "Enter") addTask();
});

function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const display =
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0");

    timerDisplay.textContent = display;
    studyTime.textContent = display;
}

document.getElementById("startBtn").onclick = () => {
    if (timerInterval !== null) return;
    localStorage.setItem("timeLeft", timeLeft);

    if (timeLeft === 0) {
        alert("Timer complete! Take a short break.");
        return;
    }

    timerInterval = setInterval(() => {
    timeLeft--;
    localStorage.setItem("timeLeft", timeLeft);
    // Count every second spent studying
    studySecondsToday++;

    // Save study time
    studyTimeToday = Math.floor(studySecondsToday / 60);
    localStorage.setItem("studyTimeToday", studyTimeToday);
    localStorage.setItem("studyDate", today);

    updateTimer();
    updateStudyGoal();

    if (timeLeft <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        alert("Study session complete! Great work!");
    }
}, 1000);
};

document.getElementById("pauseBtn").onclick = () => {
    clearInterval(timerInterval);
    timerInterval = null;
};

document.getElementById("resetBtn").onclick = () => {
    clearInterval(timerInterval);
    timerInterval = null;
    timeLeft = 25 * 60;
    updateTimer();
};

// Load saved theme
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark");
    document.getElementById("themeBtn").textContent = "☀️ Light Mode";
}

// Toggle and save theme
document.getElementById("themeBtn").onclick = () => {
    document.body.classList.toggle("dark");

    const isDark = document.body.classList.contains("dark");

    document.getElementById("themeBtn").textContent =
        isDark ? "☀️ Light Mode" : "🌙 Dark Mode";

    localStorage.setItem("theme", isDark ? "dark" : "light");
};

updateTimer();
// ===== DAILY STUDY GOALS =====
// ===== DAILY STUDY GOALS =====

let dailyGoal = Number(localStorage.getItem("dailyGoal")) || 120;

// Get today's date
const today = new Date().toLocaleDateString("en-CA");

// Check the last saved study date
const savedStudyDate = localStorage.getItem("studyDate");

// Reset study time when the date changes
if (savedStudyDate !== today) {
    localStorage.setItem("studyTimeToday", "0");
    localStorage.setItem("studyDate", today);
}

let studyTimeToday =
    Number(localStorage.getItem("studyTimeToday")) || 0;

let studySecondsToday = studyTimeToday * 60;

function updateStudyGoal() {
    document.getElementById("dailyGoal").value = dailyGoal;

    document.getElementById("goalTarget").textContent =
        dailyGoal + " minutes";

    document.getElementById("studyTimeToday").textContent =
        studyTimeToday + " minutes";

    const percentage = Math.min(
        100,
        Math.round((studyTimeToday / dailyGoal) * 100)
    );

    document.getElementById("goalProgressBar").style.width =
        percentage + "%";

    document.getElementById("goalProgressText").textContent =
        percentage + "% completed";

    document.getElementById("goalMessage").textContent =
        percentage >= 100
            ? "🎉 Daily goal completed! Excellent work!"
            : "💪 Keep going! You're " + percentage + "% there!";
}

document.getElementById("saveGoalBtn").onclick = () => {
    const input = Number(document.getElementById("dailyGoal").value);

    if (!Number.isInteger(input) || input < 1 || input > 1440) {
        alert("Please enter a goal between 1 and 1440 minutes.");
        return;
    }

    dailyGoal = input;

    localStorage.setItem("dailyGoal", dailyGoal);

    updateStudyGoal();
};

updateStudyGoal();
// Resume timer automatically after page refresh
if (timeLeft > 0 && timeLeft < 25 * 60) {
    document.getElementById("startBtn").click();
}
// ===== AI STUDY PLANNER =====

// Create difficulty dropdowns for each subject
const subjectsInput = document.getElementById("plannerSubjects");
const difficultyContainer = document.getElementById("subjectDifficultyInputs");

subjectsInput.addEventListener("input", () => {
    const subjects = subjectsInput.value
        .split(",")
        .map(subject => subject.trim())
        .filter(subject => subject !== "");

    difficultyContainer.innerHTML = "";

    subjects.forEach((subject, index) => {
        const label = document.createElement("label");
        label.textContent = subject + " difficulty:";

        const select = document.createElement("select");
        select.id = "difficulty-" + index;

        select.innerHTML = `
            <option value="difficult">Difficult</option>
            <option value="medium" selected>Medium</option>
            <option value="easy">Easy</option>
        `;

        difficultyContainer.appendChild(label);
        difficultyContainer.appendChild(select);
    });
});

document.getElementById("generatePlanBtn").onclick = () => {
    const subjectsInput = document.getElementById("plannerSubjects").value;
    const hoursInput = Number(document.getElementById("plannerHours").value);
    const output = document.getElementById("studyPlanOutput");

    const subjects = subjectsInput
        .split(",")
        .map(subject => subject.trim())
        .filter(subject => subject !== "");

    if (subjects.length === 0) {
        alert("Please enter at least one subject!");
        return;
    }

    if (!Number.isFinite(hoursInput) || hoursInput < 1 || hoursInput > 12) {
        alert("Please enter study hours between 1 and 12!");
        return;
    }

    const totalMinutes = hoursInput * 60;
   
    const weightMap = {
    difficult: 3,
    medium: 2,
    easy: 1
};

const subjectWeights = subjects.map((subject, index) => {
    const dropdown = document.getElementById("difficulty-" + index);
    return weightMap[dropdown ? dropdown.value : "medium"];
});

const totalWeight = subjectWeights.reduce((sum, weight) => sum + weight, 0);

const weights = {
    difficult: 3,
    medium: 2,
    easy: 1
};

const totalWeight = subjects.length * weights[difficulty];

let allocatedMinutes = 0;

let planHTML = "<h4>📚 Your Study Plan</h4><ul>";

subjects.forEach((subject, index) => {
    let minutes;

    if (index === subjects.length - 1) {
        minutes = totalMinutes - allocatedMinutes;
    } else {
        minutes = Math.floor(
            totalMinutes * subjectWeights[index] / totalWeight
        );
        allocatedMinutes += minutes;
    }

    planHTML += `<li><strong>${subject}</strong> — ${minutes} minutes</li>`;
});

let planHTML = "<h4>📚 Your Study Plan</h4><ul>";

let allocatedMinutes = 0;

subjects.forEach((subject, index) => {
    let minutes;

    if (index === subjects.length - 1) {
        minutes = totalMinutes - allocatedMinutes;
    } else {
        minutes = Math.floor(
            totalMinutes * subjectWeights[index] / totalWeight
        );

        allocatedMinutes += minutes;
    }

    const dropdown = document.getElementById("difficulty-" + index);
    const difficulty = dropdown ? dropdown.value : "medium";

    planHTML += `<li><strong>${subject}</strong> — ${minutes} minutes (${difficulty})</li>`;
});

planHTML += "</ul>";

    output.innerHTML = planHTML;

    localStorage.setItem("savedStudyPlan", planHTML);
localStorage.setItem("savedPlanSubjects", subjectsInput);

};
// Restore saved Study Plan after refresh
const savedStudyPlan = localStorage.getItem("savedStudyPlan");

if (savedStudyPlan) {
    document.getElementById("studyPlanOutput").innerHTML = savedStudyPlan;
}