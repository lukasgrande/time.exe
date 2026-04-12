const popupLayer = document.getElementById("popupLayer");
let completedPopups = 0;
const progress = document.getElementById("progress");
let popupSpawner;
let interval = null;
let loading = false;
let path = [];
let snakeProgress = 0;
let snakeInterval = null;
let activePopups = 0;
let overloadStart = null; // 👈 ADD THIS HERE
const maxPopups = 10;
let popupIndex = 0;
let patternMode = false;
let activePatternPopups = 0;
let patternFinished = false;
let spamMode = false;
let activeSpamPopups = 0;
const spamTarget = 500;
let reversePatternDone = false;
const isMobile = window.innerWidth < 600;
let spawnIndex = 0;

function getRandomPosition(width, height) {
  const padding = 20;

  const rows = 4; // 👈 try 3–5 depending on feel
  const rowHeight = window.innerHeight / rows;

  // 🎯 FORCE even vertical distribution
  const row = spawnIndex % rows;
  spawnIndex++;

  const y = row * rowHeight + (rowHeight - height) / 2; // centered inside row

  const x = padding + Math.random() * (window.innerWidth - width - padding * 2);

  return { x, y };
}

function bindMainButton() {
  const btn = document.getElementById("mainBtn");
  if (!btn) return; // 👈 ADD THIS (prevents crash)
  btn.addEventListener("click", () => {
    if (btn.textContent === "OK" && loading) {
      goToGridPage();
      return;
    }

    if (!loading) {
      loading = true;

      // 👇 HIDE the whole default popup
      const container = document.getElementById("container");
      if (container) container.style.display = "none";

      startLoading();
    }

    /*//if (!loading) {
    loading = true;

     👇 DEBUG SKIP
  completedPopups = 10;
  popupIndex = 10;
  patternMode = true;
  startPatternPopups();

  return;
}*/
  });
}

function startPopupSequence() {
  setTimeout(() => {
    showNextPopup();
  }, 500); // ⏱ 7 second delay
}

function showNextPopup() {
  if (popupIndex >= maxPopups) return;

  popupIndex++;

  setTimeout(() => {
    spawnSequentialPopup();
  }, 500); // ⏱ 1 sec delay
}

function startLoading() {
  setTimeout(() => {
    startPopupSequence();
  }, 1000); // ⏱ fake loading time (adjust if you want)
}

function reset() {
  clearInterval(interval);
  popupLayer.innerHTML = "";

  loading = false;
  popupIndex = 0;

  document.getElementById("container").innerHTML = `
  <button id="mainBtn">START</button>
`;

  document.getElementById("container").style.display = "flex";
  bindMainButton();
}

function getPopupSize() {
  const temp = document.createElement("div");
  temp.className = "popup";
  temp.style.visibility = "hidden";

  temp.innerHTML = `
    <div class="popupHeader">TIME.EXE</div>
    <div class="popupContent">
      <p>LOADING...</p>
      <div class="miniBar"><div class="miniProgress"></div></div>
      <button class="actionBtn">CANCEL</button>
    </div>
  `;

  document.body.appendChild(temp);

  const rect = temp.getBoundingClientRect();

  document.body.removeChild(temp);

  return {
    width: rect.width,
    height: rect.height,
  };
}

function spawnSequentialPopup() {
  const popup = document.createElement("div");
  popup.className = "popup";

  const { width: popupWidth, height: popupHeight } = getPopupSize();

  let x, y;

  if (isMobile) {
    // 📱 just center it (super simple, no stacking yet)
    x = (window.innerWidth - popupWidth) / 2;
    y = (window.innerHeight - popupHeight) / 2;
  } else {
    const pos = getRandomPosition(popupWidth, popupHeight);
    x = pos.x;
    y = pos.y;
  }

  popup.style.left = x + "px";
  popup.style.top = y + "px";

  popup.innerHTML = `
    <div class="popupHeader">TIME.EXE</div>
    <div class="popupContent">
      <p>LOADING...</p>

      <div class="miniBar">
        <div class="miniProgress"></div>
      </div>

      <button class="actionBtn">CANCEL</button>
    </div>
  `;

  popupLayer.appendChild(popup);
  makeDraggable(popup);

  startMiniLoadingSequential(popup, completedPopups);
}

let pairFinished = 0;
let chainFinished = 0;

function startMiniLoadingSequential(popup, index = 0) {
  const bar = popup.querySelector(".miniProgress");
  const btn = popup.querySelector(".actionBtn");
  const text = popup.querySelector("p");

  let value = 0;
  let finished = false;

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!finished) location.reload();
  });

  let interval;

  // 🎯 0–3 (your existing ones stay unchanged)
  if (index === 0) {
    interval = setInterval(() => {
      value += 1.5;
      if (value >= 100) finish();
      bar.style.width = value + "%";
    }, 50);
  } else if (index === 1) {
    let paused = false;
    let hasPaused = false;

    interval = setInterval(() => {
      if (!hasPaused && value >= 50) {
        paused = true;
        hasPaused = true;

        setTimeout(() => (paused = false), 8000);
        return;
      }

      if (!paused) value += 1.2;

      if (value >= 100) finish();
      bar.style.width = value + "%";
    }, 50);
  } else if (index === 2) {
    interval = setInterval(() => {
      let inc = 0.6; // ⬅️ was 0.3

      if (value > 80) {
        if (Math.random() < 0.5) return; // ⬅️ was 0.7 (less stalling)
        inc = 0.2; // ⬅️ was 0.1
      }

      value += inc;

      if (value >= 100) finish();
      bar.style.width = value + "%";
    }, 50);
  } else if (index === 3) {
    let phase = "down";
    value = 70; // 👈 IMPORTANT: start somewhere visible

    interval = setInterval(() => {
      if (phase === "down") {
        value -= 2;

        if (value <= 10) {
          phase = "up"; // switch to loading
        }
      } else {
        value += 0.4;
      }

      if (value >= 100) finish();
      if (value < 0) value = 0;

      bar.style.width = value + "%";
    }, 50);
  }
  // 🆕 4️⃣ DELAYED START
  else if (index === 4) {
    setTimeout(() => {
      interval = setInterval(() => {
        value += 1.5;
        if (value >= 100) finish();
        bar.style.width = value + "%";
      }, 50);
    }, 5000); // ⏱ 3 sec delay
  }

  // 🆕 5️⃣ + 6️⃣ PARALLEL PAIR
  else if (index === 5) {
    // spawn popup 6 immediately
    spawnExtraPopup(6); // 👈 creates #6

    // THIS ONE = slow
    interval = setInterval(() => {
      value += 0.5;
      if (value >= 100) finish();
      bar.style.width = value + "%";
    }, 50);
  } else if (index === 6) {
    // THIS ONE = fast
    interval = setInterval(() => {
      value += 3;
      if (value >= 100) finish();
      bar.style.width = value + "%";
    }, 50);
  }

  // 🆕 7️⃣ 8️⃣ 9️⃣ CHAIN START
  else if (index === 7) {
    startDelayedLoading(1000);
  } else if (index === 8) {
    startDelayedLoading(4000); // start after 0.8s
  } else if (index === 9) {
    startDelayedLoading(7000); // start after 1.6s
  } else if (index === 10) {
    startDelayedLoading(10000); // start after 1.6s
  } else if (index === 11) {
    startDelayedLoading(13000); // start after 1.6s
  }

  function startDelayedLoading(delay) {
    setTimeout(() => {
      interval = setInterval(() => {
        value += 1;
        if (value >= 100) finish();
        bar.style.width = value + "%";
      }, 50);
    }, delay);
  }

  function finish() {
    value = 100;
    clearInterval(interval);

    finished = true;

    text.textContent = "DONE";
    bar.style.background = "green";

    btn.textContent = "OK";

    btn.onclick = () => {
      popup.remove();

      // 👉 PATTERN FLOW (unchanged)
      if (patternMode) {
        activePatternPopups--;

        if (activePatternPopups === 0) {
          patternMode = false;

          // 🔁 first → reverse
          if (!reversePatternDone) {
            reversePatternDone = true;
            patternMode = true;
            startReversePatternPopups();
            return;
          }

          // 👉 AFTER reverse → center popup (unchanged)
          if (!patternFinished) {
            patternFinished = true;

            setTimeout(() => {
              spawnPostPatternPopup();
            }, 2000);

            return;
          }

          // 🚀 NEW: after vertical pattern → final 5
          startFinalFivePopups();
        }

        return;
      }

      // 👉 HANDLE SPECIAL GROUPS FIRST

      // 5 & 6 pair
      if (index === 5 || index === 6) {
        pairFinished++;

        // when BOTH are closed → spawn 7,8,9
        if (pairFinished === 2) {
          [7, 8, 9, 10, 11].forEach((i, idx) => {
            setTimeout(() => {
              spawnExtraPopup(i);
            }, idx * 150); // 👈 THIS fixes overlap
          });
        }

        return;
      }

      // 7,8,9 chain
      if (
        index === 7 ||
        index === 8 ||
        index === 9 ||
        index === 10 ||
        index === 11
      ) {
        chainFinished++;

        // ONLY when all 3 closed → start pattern
        if (chainFinished === 5) {
          patternMode = true;
          startPatternPopups();
        }

        return;
      }

      // 👉 NORMAL FLOW
      completedPopups++;

      showNextPopup();
    };
  }
}
function spawnExtraPopup(indexOverride) {
  const popup = document.createElement("div");
  popup.className = "popup";

  const { width, height } = getPopupSize();

  const { x, y } = getRandomPosition(width, height);

  popup.style.left = x + "px";
  popup.style.top = y + "px";

  popup.innerHTML = `
    <div class="popupHeader">TIME.EXE</div>
    <div class="popupContent">
      <p>LOADING...</p>
      <div class="miniBar">
        <div class="miniProgress"></div>
      </div>
      <button class="actionBtn">CANCEL</button>
    </div>
  `;

  popupLayer.appendChild(popup);
  makeDraggable(popup);

  // 👉 IMPORTANT: use manual index
  startMiniLoadingSequential(popup, indexOverride);
}
function startReversePatternPopups() {
  const { width: popupWidth, height: popupHeight } = getPopupSize();
  const { cols, rows } = getGrid();

  let queue = [];

  // 🔁 SAME diagonal logic BUT reversed
  for (let sum = cols + rows - 2; sum >= 0; sum--) {
    for (let col = cols - 1; col >= 0; col--) {
      let row = sum - col;

      if (row >= 0 && row < rows) {
        queue.push({ col, row });
      }
    }
  }

  let index = 0;

  function spawnNext() {
    if (index >= queue.length) return;

    const { col, row } = queue[index];

    const maxX = window.innerWidth - popupWidth;
    const maxY = window.innerHeight - popupHeight;

    const x = (col / (cols - 1)) * maxX;
    const y = rows === 1 ? 0 : (row / (rows - 1)) * maxY;

    spawnPatternPopup(x, y);

    index++;

    setTimeout(spawnNext, 100);
  }

  spawnNext();
}

function getGrid() {
  const { width: popupWidth, height: popupHeight } = getPopupSize();

  const cols = 6; // keep or tweak
  const rows = 5; // 👈 force 5 rows

  return { cols, rows, popupWidth, popupHeight };
}

function startPatternPopups() {
  const { width: popupWidth, height: popupHeight } = getPopupSize();
  const { cols, rows } = getGrid();

  let queue = [];

  // 🔥 diagonal ordering
  for (let sum = 0; sum < cols + rows - 1; sum++) {
    for (let col = 0; col < cols; col++) {
      let row = sum - col;

      if (row >= 0 && row < rows) {
        queue.push({ col, row });
      }
    }
  }

  let index = 0;

  function spawnNext() {
    if (index >= queue.length) return;

    const { col, row } = queue[index];

    const maxX = window.innerWidth - popupWidth;
    const maxY = window.innerHeight - popupHeight;

    // 👇 IMPORTANT CHANGE
    const x = (col / (cols - 1)) * maxX;
    const y = rows === 1 ? 0 : (row / (rows - 1)) * maxY;

    spawnPatternPopup(x, y);

    index++;

    setTimeout(spawnNext, 100);
  }

  spawnNext();
}
function rearrangePatternPopups() {
  if (!patternMode) return; // only affect pattern phase

  const popups = Array.from(document.querySelectorAll("#popupLayer .popup"));

  const { cols, rows, popupWidth, popupHeight, offsetX, offsetY } = getGrid();

  let i = 0;

  for (let sum = 0; sum < cols + rows - 1; sum++) {
    for (let col = 0; col < cols; col++) {
      let row = sum - col;

      if (row >= 0 && row < rows) {
        if (i >= popups.length) return;

        const x = offsetX + col * popupWidth;
        const y = offsetY + row * popupHeight;

        popups[i].style.left = x + "px";
        popups[i].style.top = y + "px";

        i++;
      }
    }
  }
}

function spawnPatternPopup(x, y) {
  const popup = document.createElement("div");
  popup.className = "popup";

  activePatternPopups++; // 👈 ADD THIS

  popup.style.left = x + "px";
  popup.style.top = y + "px";

  popup.innerHTML = `
    <div class="popupHeader">TIME.EXE</div>
    <div class="popupContent">
      <p>LOADING...</p>

      <div class="miniBar">
        <div class="miniProgress"></div>
      </div>

      <button class="actionBtn">CANCEL</button>
    </div>
  `;

  popupLayer.appendChild(popup);
  makeDraggable(popup);

  // 👉 reuse your existing logic
  startMiniLoadingSequential(popup);
}

function makePopupClosable(popup, button) {
  button.addEventListener("click", (e) => {
    e.stopPropagation(); // prevents weird bubbling

    popup.remove();
    activePopups--;

    if (activePopups === 0) {
      resumeMainLoading();
    }
  });
}

function resumeMainLoading() {
  let value = parseFloat(progress.style.width) || 0;

  interval = setInterval(() => {
    value += 2;

    progress.style.width = value + "%";

    if (value >= 100) {
      clearInterval(interval);

      triggerErrorState();
    }
  }, 50);
}

function triggerErrorState() {
  setTimeout(() => {
    // change text
    document.querySelector("#loadingContainer p").textContent = "DONE";

    // turn bar red
    progress.style.background = "green";

    // change button
    btn.textContent = "OK";
  }, 5000); // 👈 5 sec delay
}

function goToGridPage() {
  // stop loading completely
  clearInterval(interval);
  clearInterval(popupSpawner);

  // hide loading UI
  btn.style.display = "none";

  // show grid page
  document.getElementById("gridPage").classList.remove("hidden");

  createGrid();
}

function createGrid() {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  const size = 20; //  change grid density

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");

      cell.dataset.x = x;
      cell.dataset.y = y;

      cell.addEventListener("click", () => handleCellClick(cell));

      grid.appendChild(cell);
    }
  }
}

function startSnakeLoading() {
  snakeInterval = setInterval(() => {
    snakeProgress += 5;

    updateSnakeVisual();
  }, 100);
}

function updateSnakeVisual() {
  path.forEach((cell, index) => {
    let localProgress = snakeProgress - index * 100;

    if (localProgress < 0) localProgress = 0;
    if (localProgress > 100) localProgress = 100;
    if (!cell.classList.contains("finished")) {
      cell.classList.add("finished");

      cell.innerHTML = "CANCEL";

      cell.style.display = "flex";
      cell.style.alignItems = "center";
      cell.style.justifyContent = "center";
      cell.style.fontSize = "14px";

      cell.addEventListener("click", () => {
        location.reload();
      });
    }

    let bar = cell.querySelector(".bar");

    if (!bar) {
      bar = document.createElement("div");
      bar.classList.add("bar");

      bar.style.position = "absolute";
      bar.style.background = "#000080";

      cell.style.position = "relative";
      cell.appendChild(bar);
    }

    const dir = directions[index - 1] || "right";

    if (dir === "right") {
      bar.style.left = "0";
      bar.style.top = "0";
      bar.style.width = localProgress + "%";
      bar.style.height = "100%";
    }

    if (dir === "left") {
      bar.style.right = "0";
      bar.style.top = "0";
      bar.style.width = localProgress + "%";
      bar.style.height = "100%";
    }

    if (dir === "down") {
      bar.style.left = "0";
      bar.style.top = "0";
      bar.style.height = localProgress + "%";
      bar.style.width = "100%";
    }

    if (dir === "up") {
      bar.style.left = "0";
      bar.style.bottom = "0";
      bar.style.height = localProgress + "%";
      bar.style.width = "100%";
    }
  });
}
function getDirection(from, to) {
  const rectA = from.getBoundingClientRect();
  const rectB = to.getBoundingClientRect();

  const dx = rectB.left - rectA.left;
  const dy = rectB.top - rectA.top;

  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? "right" : "left";
  } else {
    return dy > 0 ? "down" : "up";
  }
}
let directions = [];

let currentCell = null;

function handleCellClick(cell) {
  if (!currentCell) {
    currentCell = cell;
    path.push(cell);

    cell.classList.add("merged"); // 👈 IMPORTANT (first cell!)

    updateMergedEdges(); // 👈 ADD HERE

    if (!snakeInterval) {
      startSnakeLoading();
    }

    return;
  }

  // calculate path from current → new cell
  const newPath = getPath(currentCell, cell);

  newPath.forEach((c, i) => {
    if (!path.includes(c)) {
      const prev = path[path.length - 1];

      const dir = getDirection(prev, c);
      directions.push(dir);

      path.push(c);
      c.classList.add("merged");
    }
  });

  currentCell = cell;

  updateMergedEdges(); // 👈 ADD HERE (VERY IMPORTANT)
}

function getPath(from, to) {
  const grid = document.getElementById("grid");
  const cells = Array.from(grid.children);

  let x = parseInt(from.dataset.x);
  let y = parseInt(from.dataset.y);
  const targetX = parseInt(to.dataset.x);
  const targetY = parseInt(to.dataset.y);

  let result = [];

  function getCell(x, y) {
    return cells.find(
      (c) => parseInt(c.dataset.x) === x && parseInt(c.dataset.y) === y
    );
  }

  let safety = 0;

  while ((x !== targetX || y !== targetY) && safety < 500) {
    safety++;

    let moves = [];

    // preferred moves toward target
    if (x < targetX) moves.push("right");
    if (x > targetX) moves.push("left");
    if (y < targetY) moves.push("down");
    if (y > targetY) moves.push("up");

    // random detours
    if (Math.random() < 0.3) {
      ["up", "down", "left", "right"].forEach((dir) => {
        if (!moves.includes(dir)) moves.push(dir);
      });
    }

    // shuffle moves
    moves.sort(() => Math.random() - 0.5);

    let moved = false;

    for (let dir of moves) {
      let nx = x;
      let ny = y;

      if (dir === "right") nx++;
      if (dir === "left") nx--;
      if (dir === "down") ny++;
      if (dir === "up") ny--;

      const next = getCell(nx, ny);

      // 🚫 BLOCK already used cells
      if (next && !path.includes(next)) {
        x = nx;
        y = ny;
        result.push(next);
        moved = true;
        break;
      }
    }

    // ❌ if stuck → stop path
    if (!moved) break;
  }

  return result;
}

function isNeighbor(a, b) {
  const cells = Array.from(document.querySelectorAll(".cell"));
  const i = cells.indexOf(a);
  const j = cells.indexOf(b);

  return [i - 1, i + 1, i - 10, i + 10].includes(j);
}

function updateMergedEdges() {
  const cells = Array.from(document.querySelectorAll(".cell"));

  cells.forEach((cell) => {
    cell.classList.remove("edge-top", "edge-bottom", "edge-left", "edge-right");

    if (!cell.classList.contains("merged")) return;

    const x = parseInt(cell.dataset.x);
    const y = parseInt(cell.dataset.y);

    const get = (dx, dy) =>
      cells.find(
        (c) =>
          parseInt(c.dataset.x) === x + dx && parseInt(c.dataset.y) === y + dy
      );

    if (!get(0, -1)?.classList.contains("merged"))
      cell.classList.add("edge-top");
    if (!get(0, 1)?.classList.contains("merged"))
      cell.classList.add("edge-bottom");
    if (!get(-1, 0)?.classList.contains("merged"))
      cell.classList.add("edge-left");
    if (!get(1, 0)?.classList.contains("merged"))
      cell.classList.add("edge-right");
  });
}
bindMainButton();

document.addEventListener("click", (e) => {
  const btn = e.target.closest("button");

  if (!btn) return;

  if (btn.textContent.includes("CANCEL")) {
    location.reload();
  }
});

function spawnPostPatternPopup() {
  const popup = document.createElement("div");
  popup.className = "popup";

  const { width, height } = getPopupSize();

  const x = (window.innerWidth - width) / 2;
  const y = (window.innerHeight - height) / 2;

  popup.style.left = x + "px";
  popup.style.top = y + "px";

  popup.innerHTML = `
    <div class="popupHeader">TIME.EXE</div>
    <div class="popupContent">
      <p>LOADING...</p>

      <div class="miniBar">
        <div class="miniProgress"></div>
      </div>

      <button class="actionBtn">CANCEL</button>
    </div>
  `;

  popupLayer.appendChild(popup);
  makeDraggable(popup);

  startPostPatternLoading(popup);
}

function startPostPatternLoading(popup) {
  const bar = popup.querySelector(".miniProgress");
  const btn = popup.querySelector(".actionBtn");
  const text = popup.querySelector("p");

  let value = 0;
  let finished = false;

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!finished) location.reload();
  });

  const interval = setInterval(() => {
    // 🔁 reverse glitch behavior
    value += 1;

    if (Math.random() < 0.3) value -= 2;

    // clamp
    if (value < 0) value = 0;

    if (value >= 100) {
      value = 100;
      clearInterval(interval);

      finished = true;

      text.textContent = "DONE"; // 👈 feels better with glitch
      bar.style.background = "green";

      btn.textContent = "OK";

      btn.onclick = () => {
        popup.remove();
        startVerticalPattern(); // 👈 continue flow
      };
    }

    bar.style.width = value + "%";
  }, 50);
}

function startVerticalPattern() {
  patternMode = true;
  activePatternPopups = 0;

  const { width: popupWidth, height: popupHeight } = getPopupSize();
  const { cols, rows } = getGrid();

  let queue = [];

  // 🔥 COLUMN BY COLUMN (top → bottom)
  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      queue.push({ col, row });
    }
  }

  let index = 0;

  function spawnNext() {
    if (index >= queue.length) return;

    const { col, row } = queue[index];

    const maxX = window.innerWidth - popupWidth;
    const maxY = window.innerHeight - popupHeight;

    const x = (col / (cols - 1)) * maxX;
    const y = (row / (rows - 1)) * maxY;

    spawnPatternPopup(x, y);

    index++;

    setTimeout(spawnNext, 80); // slightly faster = nice effect
  }

  spawnNext();
}

let finalIndex = 0;

function startFinalFivePopups() {
  finalIndex = 0;
  spawnFinalPopup();
}

function spawnFinalPopup() {
  if (finalIndex >= 5) return;

  const popup = document.createElement("div");
  popup.className = "popup";

  const { width, height } = getPopupSize();

  const x = (window.innerWidth - width) / 2;
  const y = (window.innerHeight - height) / 2;

  popup.style.left = x + "px";
  popup.style.top = y + "px";

  popup.innerHTML = `
    <div class="popupHeader">TIME.EXE</div>
    <div class="popupContent">
      <p>LOADING...</p>
      <div class="miniBar">
        <div class="miniProgress"></div>
      </div>
      <button class="actionBtn">CANCEL</button>
    </div>
  `;

  popupLayer.appendChild(popup);
  makeDraggable(popup);

  startFinalBehavior(popup, finalIndex);

  finalIndex++;
}

function startFinalBehavior(popup, index) {
  const bar = popup.querySelector(".miniProgress");
  const btn = popup.querySelector(".actionBtn");
  const text = popup.querySelector("p");

  let value = 0;
  let finished = false;

  btn.onclick = () => {
    if (!finished) location.reload();
  };

  let interval;

  // 🎯 SPEED CURVE (slow → insane fast)
  const speeds = [
    0.2, // 🐢 very slow
    0.6,
    1.5,
    4,
    15, // 💥 basically instant
  ];

  const speed = speeds[index] || 1;

  interval = setInterval(() => {
    value += speed;

    if (value >= 100) finish();

    bar.style.width = value + "%";
  }, 50);

  function finish() {
    clearInterval(interval);
    finished = true;

    text.textContent = "DONE";
    bar.style.background = "green";

    btn.textContent = "OK";

    btn.onclick = () => {
      popup.remove();

      if (index === 4) {
        // ⏱ FINAL PAUSE BEFORE CHAOS
        setTimeout(() => {
          startSpamPopups();
        }, 1000);
      } else {
        // ⏱ spacing between popups
        setTimeout(() => {
          spawnFinalPopup();
        }, 600);
      }
    };
  }
}

function startSpamPopups() {
  spamMode = true;

  const { width, height } = getPopupSize();

  let count = 0;

  function spawn() {
    if (count >= spamTarget) return;

    const popup = document.createElement("div");
    popup.className = "popup";

    const { x, y } = getChaosPosition(width, height);

    popup.style.left = x + "px";
    popup.style.top = y + "px";

    popup.innerHTML = `
      <div class="popupHeader">TIME.EXE</div>
      <div class="popupContent">
        <p>LOADING...</p>

        <div class="miniBar">
          <div class="miniProgress"></div>
        </div>

        <button class="actionBtn">CANCEL</button>
      </div>
    `;

    popupLayer.appendChild(popup);
    makeDraggable(popup);

    activeSpamPopups++;

    startSpamLoading(popup); // 👈 NEW

    count++;

    setTimeout(spawn, 20);
  }

  spawn();
}

function startSpamLoading(popup) {
  const bar = popup.querySelector(".miniProgress");
  const btn = popup.querySelector(".actionBtn");
  const text = popup.querySelector("p");

  let value = 0;
  let finished = false;

  // ❌ cancel still reloads everything
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!finished) location.reload();
  });

  // ⚡ fast + chaotic speeds
  const speed = 1 + Math.random() * 6;

  const interval = setInterval(() => {
    value += speed * (0.5 + Math.random());

    if (value >= 100) {
      value = 100;
      clearInterval(interval);

      finished = true;

      text.textContent = "DONE";
      bar.style.background = "green";

      btn.textContent = "OK";

      btn.onclick = () => {
        popup.remove();

        // 💥 THIS is the important part
        restartExperience();
      };
    }

    bar.style.width = value + "%";
  }, 50);
}

function makeDraggable(popup) {
  const header = popup.querySelector(".popupHeader");
  if (!header) return;

  let offsetX = 0;
  let offsetY = 0;
  let isDragging = false;

  function startDrag(clientX, clientY) {
    isDragging = true;

    const rect = popup.getBoundingClientRect();
    offsetX = clientX - rect.left;
    offsetY = clientY - rect.top;

    popup.style.zIndex = Date.now();
  }

  function moveDrag(clientX, clientY) {
    if (!isDragging) return;

    let x = clientX - offsetX;
    let y = clientY - offsetY;

    x = Math.max(0, Math.min(x, window.innerWidth - popup.offsetWidth));
    y = Math.max(0, Math.min(y, window.innerHeight - popup.offsetHeight));

    popup.style.left = x + "px";
    popup.style.top = y + "px";
  }

  function endDrag() {
    isDragging = false;
  }

  // 🖱 DESKTOP
  header.addEventListener("mousedown", (e) => {
    startDrag(e.clientX, e.clientY);
  });

  document.addEventListener("mousemove", (e) => {
    moveDrag(e.clientX, e.clientY);
  });

  document.addEventListener("mouseup", endDrag);

  // 📱 MOBILE
  header.addEventListener("touchstart", (e) => {
    const touch = e.touches[0];
    startDrag(touch.clientX, touch.clientY);
  });

  document.addEventListener("touchmove", (e) => {
    const touch = e.touches[0];
    moveDrag(touch.clientX, touch.clientY);
  });

  document.addEventListener("touchend", endDrag);
}

function restartExperience() {
  // clear everything
  popupLayer.innerHTML = "";

  // reset ALL state
  completedPopups = 0;
  popupIndex = 0;
  patternMode = false;
  activePatternPopups = 0;
  patternFinished = false;
  spamMode = false;
  activeSpamPopups = 0;
  reversePatternDone = false;
  pairFinished = 0;
  chainFinished = 0;

  // restart flow
  setTimeout(() => {
    startPopupSequence();
  }, 500);
}

function getChaosPosition(width, height) {
  return {
    x: Math.random() * (window.innerWidth - width),
    y: Math.random() * (window.innerHeight - height),
  };
}

window.addEventListener("resize", rearrangePatternPopups);
