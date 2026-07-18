const screens = {
  students: {
    title: "Students",
    content: `<div class="placeholder"><h2>Student List</h2><p>Student management begins in Milestone 2.</p></div>`
  },
  "student-detail": {
    title: "Student Detail",
    content: `<div class="placeholder"><h2>Student Detail</h2><p>Balance and history are not available in the foundation milestone.</p></div>`
  },
  "transaction-entry": {
    title: "Transaction Entry",
    content: `<div class="placeholder"><h2>Transaction Entry</h2><p>Deposit and Withdrawal recording begin in later milestones.</p></div>`
  }
};

function renderRoute() {
  const route = location.hash.slice(1) || "students";
  const selected = screens[route] ?? screens.students;
  document.querySelector("#screen-title").textContent = selected.title;
  document.querySelector("#screen").innerHTML = selected.content;
  document.querySelectorAll("nav a").forEach((link) => {
    const active = link.dataset.route === route;
    link.toggleAttribute("aria-current", active);
  });
}

async function checkSystem() {
  const status = document.querySelector("#system-status");
  try {
    const response = await fetch("/api/health", { cache: "no-store" });
    if (!response.ok) throw new Error("Unavailable");
    const result = await response.json();
    status.textContent = result.database === "connected" ? "System ready" : "System unavailable";
    status.dataset.state = result.status;
  } catch {
    status.textContent = "System unavailable";
    status.dataset.state = "unavailable";
  }
}

window.addEventListener("hashchange", renderRoute);
renderRoute();
checkSystem();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/service-worker.js");
}
