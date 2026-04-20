import SimulationController from "./core/SimulationController.js";
import RideRequest from "./models/RideRequest.js";
import Driver from "./models/Driver.js";
import DispatchEngine from "./core/DispatchEngine.js";
let spawnInterval;
let lastSpawnTime;
let Simulation = new SimulationController();
let canvas, ctx;
let riderLength = 0;
let nextDriverId = 0;
let height = 800;
let width = 1200;
let size = 40;
let amenities = ["Child seat", "Pet", "Wheelchair"];
const dividerX = 1200;
const dividerWidth = 12;
const TEXT_ONLY_MODE = false;
let textOnlyMode = TEXT_ONLY_MODE;
let statsPanelX = textOnlyMode ? 0 : dividerX + dividerWidth;
const statsPadding = 10;
const statsTabY = 12;
const statsTabHeight = 28;
const statsTabGap = 6;
const statsHeaderY = 80;
const surgeButtonWidth = 74;
const surgeButtonHeight = 20;
const textModeButtonWidth = 120;
const textModeButtonHeight = 20;
const pauseButtonY = statsHeaderY + 8;
const pauseButtonHeight = 20;
const pauseButtonWidth = 90;
const speedButtonGap = 4;
const speedButtonWidth = 34;
const speedButtonHeight = 20;
const speedMultipliers = [0.5, 1, 2, 10];
const listSubTabY = pauseButtonY + speedButtonHeight + 8;
const listSubTabHeight = 20;
const listSubTabGap = 4;
const settingsSurgeButtonY = statsHeaderY + 8;
const settingsTextModeButtonY = settingsSurgeButtonY + 24;
const settingsControlY = settingsTextModeButtonY + 24;
const gridButtonY = settingsControlY + 28;
const gridButtonGap = 4;
const gridButtonWidth = 34;
const driverControlY = gridButtonY + 28;
const driverInputWidth = 180;
const targetRatioControlY = driverControlY + 56;
const targetRatioButtonGap = 4;
const targetRatioButtonWidth = 34;
const gridSizes = [5, 10, 20, 40, 80];
const gridLabels = ["5", "10", "20", "40", "80"];
const targetRatioOptions = [0.50, 0.65, 0.85, 1.00, 1.20];
const targetRatioLabels = ["50", "65", "85", "100", "120"];
const statsViewportTop = 110;
const listViewportTop = listSubTabY + listSubTabHeight + 8;
const eventsViewportTop = 92;
const statsViewportBottomPadding = 20;
const statsLineHeight = 24;
let lastFrameTime = performance.now();
let activeStatsTab = "list";
let statsScrollByTab = { list: 0, events: 0, settings: 0, stats: 0 };
let activeListSubTab = "all";
let statsContentHeight = 0;
const baseSimulationSpeed = Simulation.simSpeed;
let activeSpeedMultiplier = 1;
let targetBusyRatio = 0.85;
let spawnBudget = 0;
let spawnIntergral = 0;
let eventWrapCache = new WeakMap();
let eventWrapCacheWidth = -1;
let cachedEventContentHeight = 0;
let cachedEventLayoutHead = null;
let cachedEventLayoutTail = null;
let cachedEventLayoutSize = -1;
let batchTargetHours = 6;
let batchTargetSeconds = batchTargetHours * 60 * 60;
const BATCH_FIXED_STEP = 1 / 60;
const BATCH_STEPS_PER_CHUNK = 5000;
let batchRunActive = false;
let batchRunDone = false;
let batchProgress = 0;
const batchButtonWidth = 132;
const batchButtonHeight = 20;
const batchButtonY = statsHeaderY + 8;
const downloadButtonWidth = 180;
const downloadButtonHeight = 28;
const statsDownloadButtonWidth = 180;
const statsDownloadButtonHeight = 20;
const statsDownloadButtonY = batchButtonY + 28;
const backButtonWidth = 120;
const backButtonHeight = 28;
let carImg = new Image();
let carImgBusy = new Image();
carImgBusy.src = "./assets/car-red.png";
carImg.src = "./assets/car-green.png";

function downloadEventLog()
{
    const text = Simulation.dispatchEngine.fullEventLogLines.join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "event-log.txt";
    link.click();

    URL.revokeObjectURL(url);
}

function seedSimulation(driverCount = 10, riderCount = 10)
{
    riderLength = 0;
    nextDriverId = 0;
    spawnBudget = 0;

    for (let i = 0; i < driverCount; i++)
    {
        spawnDriver(nextDriverId);
        nextDriverId += 1;
    }

    for (let i = 0; i < riderCount; i++)
    {
        spawnRider(riderLength);
        riderLength += 1;
    }
}

function resetSimulationForBatch()
{
    Simulation = new SimulationController();
    Simulation.simSpeed = Simulation.baseSimSpeed;
    Simulation.pause = 1;
    Simulation.loggingEnabled = true;

    activeSpeedMultiplier = 1;
    batchProgress = 0;
    batchRunDone = false;
    lastFrameTime = performance.now();

    invalidateEventLayoutCache();
    seedSimulation(10, 10);
}

function resetSimulationForDriverCount(driverCount)
{
    Simulation = new SimulationController();
    Simulation.simSpeed = baseSimulationSpeed * activeSpeedMultiplier;
    Simulation.pause = 1;

    batchRunActive = false;
    batchRunDone = false;
    batchProgress = 0;
    lastFrameTime = performance.now();

    statsScrollByTab = { list: 0, events: 0, settings: 0, stats: 0 };
    activeListSubTab = "all";
    invalidateEventLayoutCache();
    seedSimulation(driverCount, 10);
}

function startBatchRun()
{
    if (batchRunActive || batchRunDone)
        return;

    resetSimulationForBatch();
    batchRunActive = true;
    activeStatsTab = "stats";
    runBatchChunk();
}

function runBatchChunk()
{
    if (!batchRunActive)
        return;

    for (let i = 0; i < BATCH_STEPS_PER_CHUNK; i++)
    {
        if (Simulation.time >= batchTargetSeconds)
            break;

        Simulation.runSim(BATCH_FIXED_STEP);

        if (Simulation.pause == 1)
            spawnController();
    }

    batchProgress = Math.min(1, Simulation.time / batchTargetSeconds);

    if (Simulation.time >= batchTargetSeconds)
    {
        finishBatchRun();
        return;
    }

    setTimeout(runBatchChunk, 0);
}

function finishBatchRun()
{
    batchRunActive = false;
    batchRunDone = true;
    batchProgress = 1;
    Simulation.pause = 0;
    activeStatsTab = "stats";
    lastFrameTime = performance.now();
}

function drawBatchScreen()
{
    ctx.fillStyle = "#282828";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px serif";
    ctx.fillText("Running " + batchTargetHours + " Hour Simulation...", 40, 80);

    ctx.font = "18px serif";
    ctx.fillText("Progress: " + Math.round(batchProgress * 100) + "%", 40, 120);
}

function setup()
{
    canvas = document.getElementById("simCanvas");
    ctx = canvas.getContext("2d");
    canvas.width = textOnlyMode ? 420 : width + 275;
    canvas.height = height;

    canvas.addEventListener("wheel", onStatsWheel, { passive: false });
    canvas.addEventListener("mousedown", onStatsPanelMouseDown);

    seedSimulation(10, 10);
    draw();
}

function draw()
{
    if (!batchRunActive)
    {
        const now = performance.now();
        let deltaSeconds = (now - lastFrameTime) / 1000;
        deltaSeconds = Math.min(deltaSeconds, 0.1);
        lastFrameTime = now;
        Simulation.runSim(deltaSeconds);

    }

    if (batchRunActive)
    {
        drawBatchScreen();
        requestAnimationFrame(draw);
        return;
    }

    if (batchRunDone)
    {
        drawEndSimScreen();
        requestAnimationFrame(draw);
        return;
    }

    ctx.fillStyle = "#282828"
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!textOnlyMode)
    {
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(dividerX, 0, dividerWidth, canvas.height);
        drawGrid(size);
        drawRoute();
        drawDrivers();
        drawRiders();
    }

    displayStats();

    if (Simulation.pause == 1 && !batchRunDone)
        spawnController();

    requestAnimationFrame(draw);
}

function spawnController()
{
    const driverCount = Math.max(1, Simulation.driverList.size);
    let busyRatio = (driverCount - Simulation.dispatchEngine.availableCount) / driverCount;
    let waitPerDriver = Simulation.dispatchEngine.waitingCount / driverCount;

    let rate = driverCount * 0.12;
    rate += (targetBusyRatio - busyRatio) * driverCount * 0.36;
    rate -= Math.max(0, waitPerDriver - 0.05) * driverCount * 0.8;

    if (busyRatio > targetBusyRatio + 0.02)
        rate -= (busyRatio - (targetBusyRatio + 0.02)) * driverCount * 0.9;

    rate = Math.max(0, Math.min(rate, driverCount * 0.25));

    let speedMult = Simulation.simSpeed / Simulation.baseSimSpeed;
    spawnBudget += (rate * speedMult) / 60;

    while (spawnBudget >= 1)
    {
        spawnRider(riderLength);
        riderLength += 1;
        spawnBudget -= 1;
    }
}

function spawnRider(id)
{
    let location;
    do {
        location = [size * Math.floor(Math.random() * (width / size)), size * Math.floor(Math.random() * (height / size))];
    } while (location[0] < size - 10 || location[1] < size - 10 || location[0] > width - size || location[1] > height - size);
    //let passengers = Math.floor(Math.random() * 8) + 1;
    let passengers = getCount();

    let amenitiesRequired = [];

    for (let i = 0; i < amenities.length; i++)
    {
        if (Math.random() > 0.95)
            amenitiesRequired.push(amenities[i]);
    }

    let dropOff;
    do {
        dropOff = [(size * Math.floor(Math.random() * width/size)), (size * Math.floor(Math.random() * height/size))];
    } while (dropOff[0] < size-10 || dropOff[1] < size-10 || dropOff[0] > width - size || dropOff[1] > height - size || (dropOff[0] === location[0] && dropOff[1] === location[1]));

    let priority = false;
    if (Math.random() < 0.25)
        priority = true;

    let spawnTime = Simulation.getSimDate();

    let request = new RideRequest(id, location, passengers, amenitiesRequired, dropOff, priority, spawnTime);

    Simulation.addRider(request);
}

function getCount()
{
 let chance = Math.random();
    if (chance < 0.30)
        return 2;
    if (chance < 0.55)
        return 1;
    if (chance < 0.70)
        return 3;
    if (chance < 0.81)
        return 4;
    if (chance < 0.89)
        return 5;
    if (chance < 0.94)
        return 6;
    if (chance < 0.98)
        return 7;
    return 8;

}


function spawnDriver(id)
{

    let location;
    do {
        location = [(size * Math.floor(Math.random() * width/size)), (size * Math.floor(Math.random() * height/size))];

    } while (location[0] < size-10 || location[1] < size-10 || location[0] > width - size || location[1] > height - size);

    //let capacity = Math.floor(Math.random() * 5) + 3;
    let capacity = getCapacity();

    let amenitiesAvailable = [];
    for (let i = 0; i < amenities.length; i++)
    {
        if (Math.random() > 0.65)
            amenitiesAvailable.push(amenities[i]);
    }

    let driver = new Driver(id, location, capacity, amenitiesAvailable);

    Simulation.addDriver(driver);
}

function getCapacity()
{
 let chance = Math.random();
    if (chance < 0.60)
        return 5;
    if (chance < 0.70)
        return 2;
    if (chance < 0.90)
        return 7;
    return 10;
}

function drawDrivers()
{
    let curr = Simulation.driverList.head;
        while (curr !== null)
        {
            
            if (curr.state == "AVAILABLE")
            {
                ctx.drawImage(carImg, curr.location[0]-20,  curr.location[1]-20, 40, 40);
            }
            else
            {
                ctx.save();
                ctx.translate(curr.location[0], curr.location[1]);
                ctx.rotate(curr.rotation);
                ctx.drawImage(carImgBusy, -20, -20, 40, 40);
                ctx.restore();
            }

            curr = curr.next;
        }

}


function drawRiders()
{
     let curr = Simulation.riderList.head;
     let next;
        while (curr !== null)
        {
            ctx.fillStyle = "#18cc00";
            ctx.fillRect(curr.location[0]-10, curr.location[1]-10, 20, 20);

            if (curr.state == "PICKED UP")
            {
                ctx.beginPath();
                ctx.arc(curr.dropOff[0], curr.dropOff[1], 10, 0, Math.PI * 2);
                ctx.fill();
            }
            else if (curr.state == "EXPIRED")
            {
                next = curr.next;
                Simulation.riderList.remove(curr);
                curr = next;
                continue;
            }
            curr = curr.next;
        }

    curr = Simulation.priorityList.head;
    while (curr !== null)
        {
            ctx.fillStyle = "#18cc00";
            ctx.fillRect(curr.location[0]-10, curr.location[1]-10, 20, 20);

            if (curr.state == "PICKED UP")
            {
                ctx.beginPath();
                ctx.arc(curr.dropOff[0], curr.dropOff[1], 10, 0, Math.PI * 2);
                ctx.fill();
            }
            else if (curr.state == "EXPIRED")
            {
                next = curr.next;
                Simulation.priorityList.remove(curr);
                curr = next;
                continue;
            }
            curr = curr.next;
        }
        
}

function drawGrid(size)
{
    ctx.strokeStyle = '#3c3c3c'; 
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x+= size)
    {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    for (let y = 0; y < height; y+= size)
    {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}
//AI IMPLEMENTED
function getStatsTabLayout()
{
    const tabX = statsPanelX + statsPadding;
    const availableWidth = canvas.width - tabX - statsPadding;
    const tabWidth = Math.floor((availableWidth - (3 * statsTabGap)) / 4);
    const listTabX = tabX;
    const eventsTabX = listTabX + tabWidth + statsTabGap;
    const settingsTabX = eventsTabX + tabWidth + statsTabGap;
    const statsTabX = settingsTabX + tabWidth + statsTabGap;
    const listLabel = tabWidth < 120 ? "List" : "Driver/Rider List";

    return { tabWidth, listTabX, eventsTabX, settingsTabX, statsTabX, listLabel };
}

function getListSubTabLayout()
{
    const subTabs = [
        { id: "all", label: "All" },
        { id: "drivers", label: "Drivers" },
        { id: "riders", label: "Riders" },
        { id: "expired", label: "Expired" }
    ];

    const startX = statsPanelX + statsPadding;
    const availableWidth = canvas.width - startX - statsPadding;
    const tabWidth = Math.floor((availableWidth - ((subTabs.length - 1) * listSubTabGap)) / subTabs.length);

    return { subTabs, startX, tabWidth };
}

function displayStats()
{
    if (!["all", "drivers", "riders", "expired"].includes(activeListSubTab))
        activeListSubTab = "all";

    const normalFont = "16px serif";
    const sectionFont = "bold 20px serif";
    const tabFont = "13px serif";
    const tabLayout = getStatsTabLayout();
    const listTabX = tabLayout.listTabX;
    const eventsTabX = tabLayout.eventsTabX;
    const settingsTabX = tabLayout.settingsTabX;
    const statsTabX = tabLayout.statsTabX;
    const tabWidth = tabLayout.tabWidth;
    const listLabel = tabLayout.listLabel;

    const drawTab = (x, w, label, isActive) =>
    {
        ctx.fillStyle = isActive ? "#ffffff" : "#4f4f4f";
        ctx.fillRect(x, statsTabY, w, statsTabHeight);
        ctx.fillStyle = isActive ? "#1e1e1e" : "#ffffff";
        ctx.fillText(label, x + 10, statsTabY + 19);
    };

    ctx.font = tabFont;
    drawTab(listTabX, tabWidth, listLabel, activeStatsTab === "list");
    drawTab(eventsTabX, tabWidth, "Events", activeStatsTab === "events");
    drawTab(settingsTabX, tabWidth, "Settings", activeStatsTab === "settings");
    drawTab(statsTabX, tabWidth, "Stats", activeStatsTab === "stats");

    ctx.fillStyle = '#ffffff';
    ctx.font = normalFont;
    ctx.fillText("Sim time: " + Simulation.getFormattedSimTime(), statsPanelX + statsPadding, statsHeaderY);

    if (activeStatsTab === "list")
    {
        drawPauseButton(pauseButtonY);
        drawSpeedButtons("list");
        drawListSubTabs();
    }
    else if (activeStatsTab === "settings")
    {
        drawSurgeButton(settingsSurgeButtonY);
        drawTextModeButton(settingsTextModeButtonY);
        drawPauseButton(settingsControlY);
        drawSpeedButtons("settings");
        drawGridSizeButtons();
        drawDriverCountButtons();
        drawTargetRatioButtons();
    }
    else if (activeStatsTab === "stats")
    {
        const batchButtonX = statsPanelX + statsPadding;
        ctx.fillStyle = "#4f4f4f";
        ctx.fillRect(batchButtonX, batchButtonY, batchButtonWidth, batchButtonHeight);
        ctx.fillStyle = "#ffffff";
        ctx.font = "12px serif";
        ctx.fillText("Run Batch", batchButtonX + 28, batchButtonY + 14);
        ctx.fillText("Hours: " + batchTargetHours, batchButtonX + batchButtonWidth + 10, batchButtonY + 14);

        ctx.fillStyle = "#4f4f4f";
        ctx.fillRect(batchButtonX, statsDownloadButtonY, statsDownloadButtonWidth, statsDownloadButtonHeight);
        ctx.fillStyle = "#ffffff";
        ctx.fillText("Download Event Log", batchButtonX + 20, statsDownloadButtonY + 14);
    }

    let viewportTop = statsViewportTop;
    if (activeStatsTab === "list")
        viewportTop = listViewportTop;
    else if (activeStatsTab === "events")
        viewportTop = eventsViewportTop;
    const statsViewportHeight = canvas.height - viewportTop - statsViewportBottomPadding;
    const wrappedTextMaxWidth = canvas.width - statsPanelX - (statsPadding * 2) - 16;
    const eventGap = 8;

    if (activeStatsTab === "list")
    {
        if (activeListSubTab === "all")
            statsContentHeight = (7 + 2 * (Simulation.driverList.size + Simulation.priorityList.size + Simulation.riderList.size + Simulation.dispatchEngine.expiredList.size)) * statsLineHeight;
        else if (activeListSubTab === "drivers")
            statsContentHeight = Math.max(1, (1 + 2 * Simulation.driverList.size) * statsLineHeight);
        else if (activeListSubTab === "riders")
            statsContentHeight = Math.max(1, (3 + 2 * (Simulation.priorityList.size + Simulation.riderList.size)) * statsLineHeight);
        else if (activeListSubTab === "expired")
            statsContentHeight = Math.max(1, (1 + 2 * Simulation.dispatchEngine.expiredList.size) * statsLineHeight);
    }
    else if (activeStatsTab === "events")
    {
        const eventLogList = Simulation.dispatchEngine.eventLog;
        statsContentHeight = Math.max(
            1,
            getCachedEventContentHeight(eventLogList, wrappedTextMaxWidth, normalFont, statsLineHeight, eventGap)
        );
    }
    else if (activeStatsTab === "stats")
    {
        statsContentHeight = 20 * statsLineHeight;
    }
    else
        statsContentHeight = 0;

    const maxScroll = Math.max(0, statsContentHeight - statsViewportHeight);
    statsScrollByTab[activeStatsTab] = Math.max(0, Math.min(statsScrollByTab[activeStatsTab], maxScroll));
    const activeScrollY = statsScrollByTab[activeStatsTab];
    const firstVisibleLine = Math.max(0, Math.floor(activeScrollY / statsLineHeight));
    const visibleLineCount = Math.ceil(statsViewportHeight / statsLineHeight) + 1;
    const lastVisibleLine = firstVisibleLine + visibleLineCount;

    ctx.save();
    ctx.beginPath();
    ctx.rect(statsPanelX, viewportTop, canvas.width - statsPanelX, statsViewportHeight);
    ctx.clip();
    ctx.fillStyle = "#ffffff";

    const drawLine = (lineIndex, text, isSection = false) =>
    {
        if (isSection)
            ctx.font = sectionFont;
        else
            ctx.font = normalFont;
        const y = viewportTop + statsLineHeight - activeScrollY + lineIndex * statsLineHeight;
        ctx.fillText(text, statsPanelX + statsPadding, y);
    };

    let lineIndex = 0;
    const maybeDrawLine = (text, isSection = false) =>
    {
        if (lineIndex > lastVisibleLine)
            return true;

        if (lineIndex >= firstVisibleLine)
            drawLine(lineIndex, text, isSection);

        lineIndex += 1;
        return lineIndex > lastVisibleLine;
    };

    if (activeStatsTab === "list")
    {
        let done = false;
        let curr = null;
        let expiredCurr = null;

        if (activeListSubTab === "all" || activeListSubTab === "drivers")
        {
            done = maybeDrawLine("Drivers", true);
            curr = Simulation.driverList.head;
            while (!done && curr !== null)
            {
                done = maybeDrawLine("[" + Math.round(curr.location[0]) + ", " + Math.round(curr.location[1]) + "] " + curr.state + " $" + curr.profits);
                if (done)
                    break;

                if (curr.amenities.length > 0)
                    done = maybeDrawLine(curr.capacity + " seats, has: " + curr.amenities);
                else
                    done = maybeDrawLine(curr.capacity + " seats");

                curr = curr.next;
            }
        }

        if (activeListSubTab === "all" || activeListSubTab === "riders")
        {
            if (activeListSubTab === "all" && !done)
                done = maybeDrawLine("");
            if (!done)
                done = maybeDrawLine("Priority Riders", true);

            curr = Simulation.priorityList.head;
            while (!done && curr !== null)
            {
                done = maybeDrawLine("[" + Math.round(curr.location[0]) + ", " + Math.round(curr.location[1]) + "] " + curr.state + " " + Math.floor(curr.waitTimer / 60));
                if (done)
                    break;

                if (curr.amenitiesRequired.length > 0)
                    done = maybeDrawLine(curr.passengers + " people, " + curr.amenitiesRequired + " needed");
                else
                    done = maybeDrawLine(curr.passengers + " people");

                curr = curr.next;
            }

            if (!done)
                done = maybeDrawLine("");
            if (!done)
                done = maybeDrawLine("Non-Priority Riders", true);

            curr = Simulation.riderList.head;
            while (!done && curr !== null)
            {
                done = maybeDrawLine("[" + Math.round(curr.location[0]) + ", " + Math.round(curr.location[1]) + "] " + curr.state + " " + Math.floor(curr.waitTimer / 60));
                if (done)
                    break;

                if (curr.amenitiesRequired.length > 0)
                    done = maybeDrawLine(curr.passengers + " people, " + curr.amenitiesRequired + " needed");
                else
                    done = maybeDrawLine(curr.passengers + " people");

                curr = curr.next;
            }
        }

        if (activeListSubTab === "all")
        {
            if (!done)
                done = maybeDrawLine("");
            if (!done)
                done = maybeDrawLine("Expired Riders", true);

            expiredCurr = Simulation.dispatchEngine.expiredList.tail;
            while (!done && expiredCurr !== null)
            {
                const expiredRider = expiredCurr.expired !== undefined ? expiredCurr.expired : expiredCurr;
                done = maybeDrawLine("[" + Math.round(expiredRider.location[0]) + ", " + Math.round(expiredRider.location[1]) + "] " + expiredRider.state + " " + Math.floor(expiredRider.waitTimer / 60));
                if (done)
                    break;

                if (expiredRider.amenitiesRequired.length > 0)
                    done = maybeDrawLine(expiredRider.passengers + " people, " + expiredRider.amenitiesRequired + " needed");
                else
                    done = maybeDrawLine(expiredRider.passengers + " people");

                expiredCurr = expiredCurr.prev;
            }
        }

        if (activeListSubTab === "expired")
        {
            done = maybeDrawLine("Expired Riders", true);
            expiredCurr = Simulation.dispatchEngine.expiredList.tail;
            while (!done && expiredCurr !== null)
            {
                const expiredRider = expiredCurr.expired !== undefined ? expiredCurr.expired : expiredCurr;
                done = maybeDrawLine("[" + Math.round(expiredRider.location[0]) + ", " + Math.round(expiredRider.location[1]) + "] " + expiredRider.state + " " + Math.floor(expiredRider.waitTimer / 60));
                if (done)
                    break;

                if (expiredRider.amenitiesRequired.length > 0)
                    done = maybeDrawLine(expiredRider.passengers + " people, " + expiredRider.amenitiesRequired + " needed");
                else
                    done = maybeDrawLine(expiredRider.passengers + " people");

                expiredCurr = expiredCurr.prev;
            }
        }
    }
    else if (activeStatsTab === "events")
    {
        const eventLogList = Simulation.dispatchEngine.eventLog;
        let cursorY = viewportTop + statsLineHeight - activeScrollY;

        ctx.fillStyle = "#ffffff";
        ctx.font = sectionFont;
        if (cursorY >= viewportTop - statsLineHeight && cursorY <= viewportTop + statsViewportHeight)
            ctx.fillText("Events:", statsPanelX + statsPadding, cursorY);
        cursorY += statsLineHeight;

        if (!eventLogList || eventLogList.size === 0)
        {
            ctx.font = normalFont;
            if (cursorY >= viewportTop - statsLineHeight && cursorY <= viewportTop + statsViewportHeight)
                ctx.fillText("No events yet", statsPanelX + statsPadding, cursorY);
        }
        else
        {
            let currEvent = eventLogList.tail;
            while (currEvent !== null)
            {
                const eventMessage = (currEvent.event !== undefined) ? currEvent.event : String(currEvent);
                const eventText = currEvent.time !== undefined ? "[" + currEvent.time + "] " + eventMessage : eventMessage;
                const wrappedLines = getWrappedEventLines(currEvent, eventText, wrappedTextMaxWidth, normalFont);
                ctx.font = normalFont;

                for (let i = 0; i < wrappedLines.length; i++)
                {
                    if (cursorY >= viewportTop - statsLineHeight && cursorY <= viewportTop + statsViewportHeight)
                        ctx.fillText(wrappedLines[i], statsPanelX + statsPadding, cursorY);
                    cursorY += statsLineHeight;
                }

                cursorY += eventGap;
                if (cursorY > viewportTop + statsViewportHeight)
                    break;
                currEvent = currEvent.prev;
            }
        }
    }
    else if (activeStatsTab === "stats")
    {
        const statsCards = getStatsCardData();
        const cardX = statsPanelX + statsPadding;
        const cardWidth = canvas.width - cardX - statsPadding - 8;
        const cardHeight = 72;
        const cardGap = 12;
        const titleY = viewportTop + 42 - activeScrollY;

        ctx.fillStyle = "#ffffff";
        ctx.font = sectionFont;
        ctx.fillText("Stats", cardX, titleY);

        for (let i = 0; i < statsCards.length; i++)
        {
            const cardY = viewportTop + 56 + i * (cardHeight + cardGap) - activeScrollY;
            if (cardY + cardHeight < viewportTop || cardY > viewportTop + statsViewportHeight)
                continue;

            ctx.fillStyle = "#3a3a3a";
            ctx.fillRect(cardX, cardY, cardWidth, cardHeight);
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 16px serif";
            ctx.fillText(statsCards[i].label, cardX + 12, cardY + 24);
            ctx.font = "18px serif";
            ctx.fillText(statsCards[i].value, cardX + 12, cardY + 50);
        }
    }
    else
    {
        // Settings tab is controlled by buttons above.
    }

    ctx.restore();

    if (maxScroll > 0)
    {
        const trackX = canvas.width - 10;
        const trackY = viewportTop;
        const trackHeight = statsViewportHeight;
        const thumbHeight = Math.max(30, (statsViewportHeight / statsContentHeight) * trackHeight);
        const thumbY = trackY + (activeScrollY / maxScroll) * (trackHeight - thumbHeight);

        ctx.fillStyle = "#4f4f4f";
        ctx.fillRect(trackX, trackY, 4, trackHeight);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(trackX, thumbY, 4, thumbHeight);
    }

}

function onStatsWheel(event)
{
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    let viewportTop = statsViewportTop;
    if (activeStatsTab === "list")
        viewportTop = listViewportTop;
    else if (activeStatsTab === "events")
        viewportTop = eventsViewportTop;
    const statsViewportHeight = canvas.height - viewportTop - statsViewportBottomPadding;
    const maxScroll = Math.max(0, statsContentHeight - statsViewportHeight);

    if (mouseX < statsPanelX || mouseY < viewportTop || mouseY > canvas.height - statsViewportBottomPadding || maxScroll <= 0)
        return;

    statsScrollByTab[activeStatsTab] += Math.sign(event.deltaY) * statsLineHeight;
    statsScrollByTab[activeStatsTab] = Math.max(0, Math.min(statsScrollByTab[activeStatsTab], maxScroll));
    event.preventDefault();
}

function onStatsTabClick(event)
{
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const tabLayout = getStatsTabLayout();
    const listTabX = tabLayout.listTabX;
    const eventsTabX = tabLayout.eventsTabX;
    const settingsTabX = tabLayout.settingsTabX;
    const statsTabX = tabLayout.statsTabX;
    const tabWidth = tabLayout.tabWidth;

    if (mouseY < statsTabY || mouseY > statsTabY + statsTabHeight)
        return;

    if (mouseX >= listTabX && mouseX <= listTabX + tabWidth)
    {
        activeStatsTab = "list";
        return;
    }

    if (mouseX >= eventsTabX && mouseX <= eventsTabX + tabWidth)
    {
        activeStatsTab = "events";
        return;
    }

    if (mouseX >= settingsTabX && mouseX <= settingsTabX + tabWidth)
    {
        activeStatsTab = "settings";
        return;
    }

    if (mouseX >= statsTabX && mouseX <= statsTabX + tabWidth)
        activeStatsTab = "stats";
}

function drawListSubTabs()
{
    const layout = getListSubTabLayout();
    let tabX = layout.startX;
    ctx.font = "11px serif";

    for (let i = 0; i < layout.subTabs.length; i++)
    {
        const tab = layout.subTabs[i];
        const label = (layout.tabWidth < 56 && tab.compactLabel) ? tab.compactLabel : tab.label;
        const isActive = activeListSubTab === tab.id;
        ctx.fillStyle = isActive ? "#ffffff" : "#4f4f4f";
        ctx.fillRect(tabX, listSubTabY, layout.tabWidth, listSubTabHeight);
        ctx.fillStyle = isActive ? "#1e1e1e" : "#ffffff";
        ctx.fillText(label, tabX + 5, listSubTabY + 14);
        tabX += layout.tabWidth + listSubTabGap;
    }
}

function drawPauseButton(drawY)
{
    const buttonX = statsPanelX + statsPadding;
    const label = Simulation.pause === 1 ? "Pause" : "Resume";
    ctx.fillStyle = "#4f4f4f";
    ctx.fillRect(buttonX, drawY, pauseButtonWidth, pauseButtonHeight);
    ctx.fillStyle = "#ffffff";
    ctx.font = "14px serif";
    ctx.fillText(label, buttonX + 24, drawY + 14);
}

function drawSurgeButton(drawY)
{
    const buttonX = statsPanelX + statsPadding;
    ctx.fillStyle = "#4f4f4f";
    ctx.fillRect(buttonX, drawY, surgeButtonWidth, surgeButtonHeight);
    ctx.fillStyle = "#ffffff";
    ctx.font = "13px serif";
    ctx.fillText("Surge +10", buttonX + 8, drawY + 14);
}

function drawTextModeButton(drawY)
{
    const buttonX = statsPanelX + statsPadding;
    ctx.fillStyle = textOnlyMode ? "#ffffff" : "#4f4f4f";
    ctx.fillRect(buttonX, drawY, textModeButtonWidth, textModeButtonHeight);
    ctx.fillStyle = textOnlyMode ? "#1e1e1e" : "#ffffff";
    ctx.font = "12px serif";
    ctx.fillText("Text only mode", buttonX + 12, drawY + 14);
}

function getSpeedButtonsStartX(tab)
{
    if (tab === "settings")
        return statsPanelX + statsPadding + pauseButtonWidth + 6;
    return statsPanelX + statsPadding + pauseButtonWidth + 6;
}

function drawSpeedButtons(tab)
{
    const startX = getSpeedButtonsStartX(tab);
    const drawY = (tab === "settings") ? settingsControlY : pauseButtonY;
    const labels = ["0.5X", "1X", "2X", "10X"];
    ctx.font = "12px serif";

    for (let i = 0; i < labels.length; i++)
    {
        const buttonX = startX + i * (speedButtonWidth + speedButtonGap);
        if (speedMultipliers[i] === activeSpeedMultiplier)
        {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(buttonX, drawY, speedButtonWidth, speedButtonHeight);
            ctx.fillStyle = "#1e1e1e";
        }
        else
        {
            ctx.fillStyle = "#4f4f4f";
            ctx.fillRect(buttonX, drawY, speedButtonWidth, speedButtonHeight);
            ctx.fillStyle = "#ffffff";
        }
        ctx.fillText(labels[i], buttonX + 6, drawY + 14);
    }
}

function drawGridSizeButtons()
{
    const startX = statsPanelX + statsPadding;
    let buttonX = startX;
    ctx.font = "12px serif";

    for (let i = 0; i < gridSizes.length; i++)
    {
        const buttonWidth = gridButtonWidth;
        if (size === gridSizes[i])
        {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(buttonX, gridButtonY, buttonWidth, speedButtonHeight);
            ctx.fillStyle = "#1e1e1e";
        }
        else
        {
            ctx.fillStyle = "#4f4f4f";
            ctx.fillRect(buttonX, gridButtonY, buttonWidth, speedButtonHeight);
            ctx.fillStyle = "#ffffff";
        }

        ctx.fillText(gridLabels[i], buttonX + 6, gridButtonY + 14);
        buttonX += buttonWidth + gridButtonGap;
    }
}

function drawDriverCountButtons()
{
    const startX = statsPanelX + statsPadding;

    ctx.fillStyle = "#ffffff";
    ctx.font = "12px serif";
    ctx.fillText("Drivers: " + Simulation.driverList.size, startX, driverControlY + 14);

    ctx.fillStyle = "#4f4f4f";
    ctx.fillRect(startX, driverControlY + 20, driverInputWidth, speedButtonHeight);
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Set driver count", startX + 28, driverControlY + 34);
}

function drawTargetRatioButtons()
{
    const startX = statsPanelX + statsPadding;

    ctx.fillStyle = "#ffffff";
    ctx.font = "12px serif";
    ctx.fillText("Target busy: " + Math.round(targetBusyRatio * 100) + "%", startX, targetRatioControlY + 14);

    let buttonX = startX;
    for (let i = 0; i < targetRatioOptions.length; i++)
    {
        if (targetBusyRatio === targetRatioOptions[i])
        {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(buttonX, targetRatioControlY + 20, targetRatioButtonWidth, speedButtonHeight);
            ctx.fillStyle = "#1e1e1e";
        }
        else
        {
            ctx.fillStyle = "#4f4f4f";
            ctx.fillRect(buttonX, targetRatioControlY + 20, targetRatioButtonWidth, speedButtonHeight);
            ctx.fillStyle = "#ffffff";
        }

        ctx.fillText(targetRatioLabels[i], buttonX + 6, targetRatioControlY + 34);
        buttonX += targetRatioButtonWidth + targetRatioButtonGap;
    }
}

function onStatsPanelMouseDown(event)
{
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    if (batchRunDone)
    {
        const layout = getEndSimLayout();
        const downloadButtonX = layout.downloadButtonX;
        const downloadButtonY = layout.downloadButtonY;
        const backButtonX = layout.backButtonX;
        const backButtonY = layout.backButtonY;

        if (
            mouseX >= downloadButtonX &&
            mouseX <= downloadButtonX + downloadButtonWidth &&
            mouseY >= downloadButtonY &&
            mouseY <= downloadButtonY + downloadButtonHeight
        )
        {
            downloadEventLog();
            return;
        }

        if (
            mouseX >= backButtonX &&
            mouseX <= backButtonX + backButtonWidth &&
            mouseY >= backButtonY &&
            mouseY <= backButtonY + backButtonHeight
        )
        {
            batchRunDone = false;
            lastFrameTime = performance.now();
            return;
        }

        return;
    }

    const tabLayout = getStatsTabLayout();
    const listTabX = tabLayout.listTabX;
    const eventsTabX = tabLayout.eventsTabX;
    const settingsTabX = tabLayout.settingsTabX;
    const statsTabX = tabLayout.statsTabX;
    const tabWidth = tabLayout.tabWidth;
    const inTabRow = mouseY >= statsTabY && mouseY <= statsTabY + statsTabHeight;

    if (batchRunActive)
        return;

    if (inTabRow &&
        ((mouseX >= listTabX && mouseX <= listTabX + tabWidth) ||
        (mouseX >= eventsTabX && mouseX <= eventsTabX + tabWidth) ||
        (mouseX >= settingsTabX && mouseX <= settingsTabX + tabWidth) ||
        (mouseX >= statsTabX && mouseX <= statsTabX + tabWidth)))
    {
        onStatsTabClick(event);
        return;
    }

    const buttonX = statsPanelX + statsPadding;
    const surgeButtonX = statsPanelX + statsPadding;
    const textModeButtonX = statsPanelX + statsPadding;
    const settingsPauseButtonX = statsPanelX + statsPadding;
    const speedStartXList = getSpeedButtonsStartX("list");
    const speedStartXSettings = getSpeedButtonsStartX("settings");

    if (activeStatsTab === "list")
    {
        if (mouseY >= listSubTabY && mouseY <= listSubTabY + listSubTabHeight)
        {
            const subLayout = getListSubTabLayout();
            let subTabX = subLayout.startX;
            for (let i = 0; i < subLayout.subTabs.length; i++)
            {
                if (mouseX >= subTabX && mouseX <= subTabX + subLayout.tabWidth)
                {
                    activeListSubTab = subLayout.subTabs[i].id;
                    statsScrollByTab.list = 0;
                    return;
                }
                subTabX += subLayout.tabWidth + listSubTabGap;
            }
        }

        if (mouseX >= buttonX && mouseX <= buttonX + pauseButtonWidth && mouseY >= pauseButtonY && mouseY <= pauseButtonY + pauseButtonHeight)
        {
            Simulation.pause = Simulation.pause === 1 ? 0 : 1;
            lastFrameTime = performance.now();
            return;
        }

        if (mouseY >= pauseButtonY && mouseY <= pauseButtonY + speedButtonHeight)
        {
            for (let i = 0; i < speedMultipliers.length; i++)
            {
                const speedX = speedStartXList + i * (speedButtonWidth + speedButtonGap);
                if (mouseX >= speedX && mouseX <= speedX + speedButtonWidth)
                {
                    activeSpeedMultiplier = speedMultipliers[i];
                    Simulation.simSpeed = baseSimulationSpeed * activeSpeedMultiplier;
                    return;
                }
            }
        }
    }
    else if (activeStatsTab === "settings")
    {
        if (mouseX >= surgeButtonX && mouseX <= surgeButtonX + surgeButtonWidth && mouseY >= settingsSurgeButtonY && mouseY <= settingsSurgeButtonY + surgeButtonHeight)
        {
            for (let i = 0; i < 10; i++)
            {
                spawnRider(riderLength);
                riderLength += 1;
            }
            return;
        }

        if (mouseX >= textModeButtonX && mouseX <= textModeButtonX + textModeButtonWidth && mouseY >= settingsTextModeButtonY && mouseY <= settingsTextModeButtonY + textModeButtonHeight)
        {
            textOnlyMode = !textOnlyMode;
            statsPanelX = textOnlyMode ? 0 : dividerX + dividerWidth;
            canvas.width = textOnlyMode ? 420 : width + 275;
            invalidateEventLayoutCache();
            return;
        }

        if (mouseX >= settingsPauseButtonX && mouseX <= settingsPauseButtonX + pauseButtonWidth && mouseY >= settingsControlY && mouseY <= settingsControlY + pauseButtonHeight)
        {
            Simulation.pause = Simulation.pause === 1 ? 0 : 1;
            lastFrameTime = performance.now();
            return;
        }

        if (mouseY >= settingsControlY && mouseY <= settingsControlY + speedButtonHeight)
        {
            for (let i = 0; i < speedMultipliers.length; i++)
            {
                const speedX = speedStartXSettings + i * (speedButtonWidth + speedButtonGap);
                if (mouseX >= speedX && mouseX <= speedX + speedButtonWidth)
                {
                    activeSpeedMultiplier = speedMultipliers[i];
                    Simulation.simSpeed = baseSimulationSpeed * activeSpeedMultiplier;
                    return;
                }
            }
        }

        if (mouseY >= gridButtonY && mouseY <= gridButtonY + speedButtonHeight)
        {
            let gridX = statsPanelX + statsPadding;
            for (let i = 0; i < gridSizes.length; i++)
            {
                const buttonWidth = gridButtonWidth;
                if (mouseX >= gridX && mouseX <= gridX + buttonWidth)
                {
                    size = gridSizes[i];
                    return;
                }
                gridX += buttonWidth + gridButtonGap;
            }
        }

        if (mouseY >= driverControlY + 20 && mouseY <= driverControlY + 20 + speedButtonHeight)
        {
            const driverInputX = statsPanelX + statsPadding;
            if (mouseX >= driverInputX && mouseX <= driverInputX + driverInputWidth)
            {
                const driverInput = window.prompt("Enter the number of drivers:", String(Simulation.driverList.size));
                if (driverInput === null)
                    return;

                const parsedDrivers = Math.floor(Number(driverInput));
                if (!Number.isFinite(parsedDrivers) || parsedDrivers < 1)
                    return;

                resetSimulationForDriverCount(parsedDrivers);
                return;
            }
        }

        if (mouseY >= targetRatioControlY + 20 && mouseY <= targetRatioControlY + 20 + speedButtonHeight)
        {
            let targetRatioX = statsPanelX + statsPadding;
            for (let i = 0; i < targetRatioOptions.length; i++)
            {
                if (mouseX >= targetRatioX && mouseX <= targetRatioX + targetRatioButtonWidth)
                {
                    targetBusyRatio = targetRatioOptions[i];
                    return;
                }
                targetRatioX += targetRatioButtonWidth + targetRatioButtonGap;
            }
        }
    }
    else if (activeStatsTab === "stats")
{
    const batchButtonX = statsPanelX + statsPadding;
    const downloadButtonX = batchButtonX;

    if (mouseX >= batchButtonX && mouseX <= batchButtonX + batchButtonWidth &&
        mouseY >= batchButtonY && mouseY <= batchButtonY + batchButtonHeight)
    {
        const hoursInput = window.prompt("Enter the number of hours to run:", String(batchTargetHours));
        if (hoursInput === null)
            return;

        const parsedHours = Number(hoursInput);
        if (!Number.isFinite(parsedHours) || parsedHours <= 0)
            return;

        batchTargetHours = parsedHours;
        batchTargetSeconds = batchTargetHours * 60 * 60;
        startBatchRun();
        return;
    }

    if (mouseX >= downloadButtonX && mouseX <= downloadButtonX + statsDownloadButtonWidth &&
        mouseY >= statsDownloadButtonY && mouseY <= statsDownloadButtonY + statsDownloadButtonHeight)
    {
        downloadEventLog();
        return;
    }
}


}


function invalidateEventLayoutCache()
{
    eventWrapCache = new WeakMap();
    eventWrapCacheWidth = -1;
    cachedEventContentHeight = 0;
    cachedEventLayoutHead = null;
    cachedEventLayoutTail = null;
    cachedEventLayoutSize = -1;
}

function getWrappedEventLines(eventNode, eventText, maxWidth, font)
{
    if (eventWrapCacheWidth !== maxWidth)
    {
        eventWrapCache = new WeakMap();
        eventWrapCacheWidth = maxWidth;
        cachedEventContentHeight = 0;
        cachedEventLayoutHead = null;
        cachedEventLayoutTail = null;
        cachedEventLayoutSize = -1;
    }

    const cachedWrap = eventWrapCache.get(eventNode);
    if (cachedWrap && cachedWrap.text === eventText && cachedWrap.font === font)
        return cachedWrap.lines;

    ctx.font = font;
    const words = String(eventText).split(" ");
    const lines = [];
    let currentLine = "";

    for (let i = 0; i < words.length; i++)
    {
        const testLine = currentLine === "" ? words[i] : currentLine + " " + words[i];
        if (ctx.measureText(testLine).width <= maxWidth || currentLine === "")
            currentLine = testLine;
        else
        {
            lines.push(currentLine);
            currentLine = words[i];
        }
    }

    if (currentLine !== "")
        lines.push(currentLine);

    const wrappedLines = lines.length > 0 ? lines : [""];
    eventWrapCache.set(eventNode, { text: eventText, font, lines: wrappedLines });
    return wrappedLines;
}

function getCachedEventContentHeight(eventLogList, maxWidth, font, lineHeight, eventGap)
{
    if (!eventLogList || eventLogList.size === 0)
        return 2 * lineHeight;

    if (
        cachedEventLayoutHead === eventLogList.head &&
        cachedEventLayoutTail === eventLogList.tail &&
        cachedEventLayoutSize === eventLogList.size &&
        eventWrapCacheWidth === maxWidth
    )
        return cachedEventContentHeight;

    let eventContentHeight = lineHeight;
    let currEvent = eventLogList.tail;
    while (currEvent !== null)
    {
        const eventText = (currEvent.event !== undefined) ? currEvent.event : String(currEvent);
        eventContentHeight += (getWrappedEventLines(currEvent, eventText, maxWidth, font).length * lineHeight) + eventGap;
        currEvent = currEvent.prev;
    }

    cachedEventContentHeight = eventContentHeight;
    cachedEventLayoutHead = eventLogList.head;
    cachedEventLayoutTail = eventLogList.tail;
    cachedEventLayoutSize = eventLogList.size;
    return cachedEventContentHeight;
}

function getStatsCardData()
{
    return [
        { label: "Average wait time", value: Math.round(Simulation.averageWaitTime) + " minutes" },
        { label: "Average ride time", value: Math.round(Simulation.averageRideTime) + " minutes" },
        { label: "Expired rides per hour", value: Simulation.averageExpiredPerHour.toFixed(2) + " riders" },
        { label: "Average percent of busy drivers", value: Math.round(Simulation.averageBusy) + "%" },
        { label: "Total rides done", value: Simulation.dispatchEngine.rideAmount },
        { label: "Total earnings", value: "$" + Simulation.dispatchEngine.totalProfits }
    ];
}

function getEndSimLayout()
{
    const panelWidth = Math.min(520, canvas.width - 80);
    const panelX = Math.max(40, (canvas.width - panelWidth) / 2);
    const panelY = 48;
    const cardHeight = 72;
    const cardGap = 12;
    const statsCards = getStatsCardData();
    const panelHeight = 120 + statsCards.length * (cardHeight + cardGap) + 36;
    const downloadButtonX = panelX + 18;
    const downloadButtonY = panelY + panelHeight - 52;
    const backButtonX = panelX + panelWidth - backButtonWidth - 18;
    const backButtonY = downloadButtonY;

    return {
        panelWidth,
        panelX,
        panelY,
        cardHeight,
        cardGap,
        statsCards,
        panelHeight,
        downloadButtonX,
        downloadButtonY,
        backButtonX,
        backButtonY
    };
}

function drawEndSimScreen()
{
    ctx.fillStyle = "#282828";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const layout = getEndSimLayout();
    const panelWidth = layout.panelWidth;
    const panelX = layout.panelX;
    const panelY = layout.panelY;
    const cardHeight = layout.cardHeight;
    const cardGap = layout.cardGap;
    const statsCards = layout.statsCards;
    const panelHeight = layout.panelHeight;

    ctx.fillStyle = "#333333";
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px serif";
    ctx.fillText("Simulation Complete", panelX + 24, panelY + 42);

    ctx.font = "16px serif";
    ctx.fillText("Duration: " + batchTargetHours + " hours", panelX + 24, panelY + 72);
    ctx.fillText("End time: " + Simulation.getFormattedSimTime(), panelX + 24, panelY + 96);

    for (let i = 0; i < statsCards.length; i++)
    {
        const cardY = panelY + 118 + i * (cardHeight + cardGap);
        ctx.fillStyle = "#3f3f3f";
        ctx.fillRect(panelX + 18, cardY, panelWidth - 36, cardHeight);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 16px serif";
        ctx.fillText(statsCards[i].label, panelX + 30, cardY + 24);
        ctx.font = "18px serif";
        ctx.fillText(statsCards[i].value, panelX + 30, cardY + 50);
    }

    const downloadButtonX = layout.downloadButtonX;
    const downloadButtonY = layout.downloadButtonY;
    ctx.fillStyle = "#4f4f4f";
    ctx.fillRect(downloadButtonX, downloadButtonY, downloadButtonWidth, downloadButtonHeight);
    ctx.fillStyle = "#ffffff";
    ctx.font = "14px serif";
    ctx.fillText("Download Event Log", downloadButtonX + 20, downloadButtonY + 19);

    const backButtonX = layout.backButtonX;
    const backButtonY = layout.backButtonY;
    ctx.fillStyle = "#4f4f4f";
    ctx.fillRect(backButtonX, backButtonY, backButtonWidth, backButtonHeight);
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Back to Sim", backButtonX + 23, backButtonY + 19);
}

//AI IMPLEMENTATION DONE ^
function drawRoute()
{
    let curr = Simulation.driverList.head;

    while (curr !== null)
    {
        if (curr.state == "PICKING UP")
        {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(curr.location[0], curr.location[1]);
        ctx.lineTo(curr.assignedRider.location[0], curr.location[1]);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(curr.assignedRider.location[0], curr.location[1]);
        ctx.lineTo(curr.assignedRider.location[0], curr.assignedRider.location[1]);
        ctx.stroke();
        }

        if (curr.state == "DROPPING OFF")
        {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(curr.location[0], curr.location[1]);
        ctx.lineTo(curr.assignedRider.dropOff[0], curr.location[1]);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(curr.assignedRider.dropOff[0], curr.location[1]);
        ctx.lineTo(curr.assignedRider.dropOff[0], curr.assignedRider.dropOff[1]);
        ctx.stroke();
        }
        curr = curr.next;
    }
}

window.onload = function()
{
    setup();
};
