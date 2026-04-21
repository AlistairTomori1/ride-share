import SimulationController from "./core/SimulationController.js";
import RideRequest from "./models/RideRequest.js";
import Driver from "./models/Driver.js";
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
let textOnlyMode = false;
let statsPanelX = textOnlyMode ? 0 : dividerX + dividerWidth;
const statsPadding = 10;
const statsTabY = 12;
const statsTabHeight = 28;
const statsTabGap = 6;
const statsHeaderY = 80;
const pauseButtonY = statsHeaderY + 8;
const pauseButtonHeight = 20;
const pauseButtonWidth = 90;
const speedButtonGap = 4;
const speedButtonWidth = 34;
const speedButtonHeight = 20;
const listSubTabY = pauseButtonY + speedButtonHeight + 8;
const listSubTabHeight = 20;
const listSubTabGap = 4;
const gridButtonGap = 4;
const gridButtonWidth = 34;
const targetRatioButtonGap = 4;
const statsViewportBottomPadding = 20;
const statsLineHeight = 24;
const NORMAL_FIXED_STEP = 1 / 120;
const MAX_SIM_STEPS_PER_FRAME = 8;
let lastFrameTime = performance.now();
let simAccumulator = 0;
let activeStatsTab = "list";
let statsScrollByTab = { list: 0, events: 0, settings: 0, stats: 0 };
let activeListSubTab = "all";
let statsContentHeight = 0;
const baseSimulationSpeed = Simulation.simSpeed;
let activeSpeedMultiplier = 1;
let targetBusyRatio = 0.85;
let spawnBudget = 0;
let completionRateEma = 0;
let spawnRateEma = 0;
let lastCompletedRideCount = 0;
let busyErrorIntegral = 0;
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
let carImg = new Image();
let carImgBusy = new Image();
carImgBusy.src = "./assets/car-red.png";
carImg.src = "./assets/car-green.png";



function setup()
{
    //define the canvase and start draw loop
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
    if (!batchRunActive && !batchRunDone)
    {
        //real time sim run
        const now = performance.now();
        let frameSeconds = (now - lastFrameTime) / 1000;
        frameSeconds = Math.min(frameSeconds, 0.1);
        lastFrameTime = now;

        if (Simulation.pause == 1)
        {
            simAccumulator += frameSeconds;

            let stepCount = 0;
            while (simAccumulator >= NORMAL_FIXED_STEP && stepCount < MAX_SIM_STEPS_PER_FRAME)
            {
                Simulation.runSim(NORMAL_FIXED_STEP);
                spawnController(NORMAL_FIXED_STEP);
                simAccumulator -= NORMAL_FIXED_STEP;
                stepCount += 1;
            }

            if (stepCount === MAX_SIM_STEPS_PER_FRAME && simAccumulator >= NORMAL_FIXED_STEP)
                simAccumulator = 0;
        }
        else
            simAccumulator = 0;
    }

    //batch run
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

    //text only mode
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

    requestAnimationFrame(draw);
}
//decides wether or not to spawn a rider
function spawnController(deltaSeconds)
{
    const driverCount = Simulation.driverList.size;
    const controllerSeconds = deltaSeconds * 60 * (Simulation.simSpeed / Simulation.baseSimSpeed);
    const waitPerDriver = Simulation.dispatchEngine.waitingCount / driverCount;
    const completionRate = (Simulation.dispatchEngine.rideAmount - lastCompletedRideCount) / controllerSeconds;
    const desiredWaitPerDriver = targetBusyRatio <= 0.85 ? 0.01 : 0.01 + ((targetBusyRatio - 0.85) * 0.60);
    const busyError = (Math.min(targetBusyRatio, 1)) - ((driverCount - Simulation.dispatchEngine.availableCount) / driverCount);

    completionRateEma += (completionRate - completionRateEma) * 0.10;
    lastCompletedRideCount = Simulation.dispatchEngine.rideAmount;
    busyErrorIntegral += busyError * controllerSeconds;
    busyErrorIntegral = Math.max(-120, Math.min(120, busyErrorIntegral));

    let rate = completionRateEma;
    rate += busyError * driverCount * 0.45;
    rate += busyErrorIntegral * driverCount * 0.015;
    rate += (desiredWaitPerDriver - waitPerDriver) * driverCount * 0.35;

    if (waitPerDriver > desiredWaitPerDriver + 0.08)
        rate -= (waitPerDriver - (desiredWaitPerDriver + 0.08)) * driverCount * 2.0;

    rate = Math.max(0, Math.min(rate, driverCount * 0.5));
    spawnRateEma += (rate - spawnRateEma) * 0.20;
    spawnBudget += spawnRateEma * controllerSeconds;

    while (spawnBudget >= 1)
    {
        spawnRider(riderLength);
        riderLength += 1;
        spawnBudget -= 1;
    }
}

//add a rider with their own properties
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
//get the rider count
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

//spawn a driver with their properties
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
//gets their capacity
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

//runs to daw the grid
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

//draw the route for each trip
function drawRoute()
{
    let curr = Simulation.driverList.head;

    while (curr !== null)
    {
        if (curr.state == "PICKING UP")
            drawManhattanRoute(curr.location[0], curr.location[1], curr.assignedRider.location[0], curr.assignedRider.location[1]);

        if (curr.state == "DROPPING OFF")
            drawManhattanRoute(curr.location[0], curr.location[1], curr.assignedRider.dropOff[0], curr.assignedRider.dropOff[1]);
        curr = curr.next;
    }
}

//this displays the drivers
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
//this displays each rider
function drawRiderList(list)
{
    let curr = list.head;
    let next;

    while (curr !== null)
    {
        ctx.fillStyle = "#18cc00";
        ctx.fillRect(curr.location[0] - 10, curr.location[1] - 10, 20, 20);

        if (curr.state == "PICKED UP")
        {
            ctx.beginPath();
            ctx.arc(curr.dropOff[0], curr.dropOff[1], 10, 0, Math.PI * 2);
            ctx.fill();
        }
        else if (curr.state == "EXPIRED")
        {
            next = curr.next;
            list.remove(curr);
            curr = next;
            continue;
        }

        curr = curr.next;
    }
}

function drawRiders()
{
    drawRiderList(Simulation.riderList);
    drawRiderList(Simulation.priorityList);
}

//event log download
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
    completionRateEma = 0;
    spawnRateEma = 0;
    lastCompletedRideCount = 0;
    busyErrorIntegral = 0;

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

function resetFrameTiming()
{
    lastFrameTime = performance.now();
    simAccumulator = 0;
}

function resetUiState()
{
    batchRunActive = false;
    batchRunDone = false;
    batchProgress = 0;
    statsScrollByTab = { list: 0, events: 0, settings: 0, stats: 0 };
    activeListSubTab = "all";
    resetFrameTiming();
    invalidateEventLayoutCache();
}

function resetSimulationState(configureSimulation, driverCount = 10, riderCount = 10)
{
    Simulation = new SimulationController();
    resetUiState();
    configureSimulation();
    seedSimulation(driverCount, riderCount);
}

function resetSimulationForBatch()
{
    resetSimulationState(() =>
    {
        Simulation.simSpeed = Simulation.baseSimSpeed;
        Simulation.pause = 1;
        Simulation.loggingEnabled = true;
        activeSpeedMultiplier = 1;
    });
}

function resetSimulationForDriverCount(driverCount)
{
    resetSimulationState(() =>
    {
        Simulation.simSpeed = baseSimulationSpeed * activeSpeedMultiplier;
        Simulation.pause = 1;
    }, driverCount, 10);
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
            spawnController(BATCH_FIXED_STEP);
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
    resetFrameTiming();
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

function drawManhattanRoute(fromX, fromY, toX, toY)
{
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, fromY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
}

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
    const items = [
        { label: "All", value: "all" },
        { label: "Drivers", value: "drivers" },
        { label: "Riders", value: "riders" },
        { label: "Expired", value: "expired" }
    ];
    const startX = statsPanelX + statsPadding;
    const availableWidth = canvas.width - startX - statsPadding;
    const tabWidth = Math.floor((availableWidth - ((items.length - 1) * listSubTabGap)) / items.length);

    return { items, startX, tabWidth };
}

function getStatsTabItems(tabLayout)
{
    return [
        { label: tabLayout.listLabel, value: "list" },
        { label: "Events", value: "events" },
        { label: "Settings", value: "settings" },
        { label: "Stats", value: "stats" }
    ];
}

function getGridButtonItems()
{
    return [
        { label: "5", value: 5 },
        { label: "10", value: 10 },
        { label: "20", value: 20 },
        { label: "40", value: 40 },
        { label: "80", value: 80 }
    ];
}

function getTargetRatioButtonItems()
{
    return [
        { label: "50", value: 0.50 },
        { label: "65", value: 0.65 },
        { label: "85", value: 0.85 },
        { label: "100", value: 1.00 },
        { label: "120", value: 1.20 }
    ];
}

function getSpeedButtonItems()
{
    return [
        { label: "0.5X", value: 0.5 },
        { label: "1X", value: 1 },
        { label: "2X", value: 2 },
        { label: "10X", value: 10 }
    ];
}

function getSettingsLayout()
{
    const surgeY = statsHeaderY + 8;
    const textModeY = surgeY + 24;
    const controlsY = textModeY + 24;
    const gridY = controlsY + 28;
    const driverY = gridY + 28;
    const targetRatioY = driverY + 56;

    return { surgeY, textModeY, controlsY, gridY, driverY, targetRatioY };
}

function getActiveViewportTop(tab = activeStatsTab)
{
    if (tab === "list")
        return listSubTabY + listSubTabHeight + 8;
    if (tab === "events")
        return 92;
    return 110;
}

function getStatsViewportHeight(tab = activeStatsTab)
{
    return canvas.height - getActiveViewportTop(tab) - statsViewportBottomPadding;
}

function isPointInRect(mouseX, mouseY, x, y, width, height)
{
    return mouseX >= x && mouseX <= x + width && mouseY >= y && mouseY <= y + height;
}

function drawButtonRow(startX, y, buttonWidth, buttonHeight, gap, items, activeValue, font = "12px serif", textPaddingX = 6, textOffsetY = 14)
{
    ctx.font = font;
    let buttonX = startX;

    for (let i = 0; i < items.length; i++)
    {
        const isActive = items[i].value === activeValue;
        ctx.fillStyle = isActive ? "#ffffff" : "#4f4f4f";
        ctx.fillRect(buttonX, y, buttonWidth, buttonHeight);
        ctx.fillStyle = isActive ? "#1e1e1e" : "#ffffff";
        ctx.fillText(items[i].label, buttonX + textPaddingX, y + textOffsetY);
        buttonX += buttonWidth + gap;
    }
}

function getClickedButtonRowValue(mouseX, mouseY, startX, y, buttonWidth, buttonHeight, gap, items)
{
    if (mouseY < y || mouseY > y + buttonHeight)
        return null;

    let buttonX = startX;
    for (let i = 0; i < items.length; i++)
    {
        if (mouseX >= buttonX && mouseX <= buttonX + buttonWidth)
            return items[i].value;
        buttonX += buttonWidth + gap;
    }

    return null;
}

function togglePause()
{
    Simulation.pause = Simulation.pause === 1 ? 0 : 1;
    resetFrameTiming();
}

function applySpeedMultiplier(multiplier)
{
    activeSpeedMultiplier = multiplier;
    Simulation.simSpeed = baseSimulationSpeed * activeSpeedMultiplier;
}

function spawnSurgeRiders(count = 10)
{
    for (let i = 0; i < count; i++)
    {
        spawnRider(riderLength);
        riderLength += 1;
    }
}

function toggleTextOnlyMode()
{
    textOnlyMode = !textOnlyMode;
    statsPanelX = textOnlyMode ? 0 : dividerX + dividerWidth;
    canvas.width = textOnlyMode ? 420 : width + 275;
    invalidateEventLayoutCache();
}

function getStatsContentHeight(wrappedTextMaxWidth, normalFont, eventGap)
{
    if (activeStatsTab === "list")
    {
        if (activeListSubTab === "all")
            return (7 + 2 * (Simulation.driverList.size + Simulation.priorityList.size + Simulation.riderList.size + Simulation.dispatchEngine.expiredList.size)) * statsLineHeight;
        if (activeListSubTab === "drivers")
            return Math.max(1, (1 + 2 * Simulation.driverList.size) * statsLineHeight);
        if (activeListSubTab === "riders")
            return Math.max(1, (3 + 2 * (Simulation.priorityList.size + Simulation.riderList.size)) * statsLineHeight);
        if (activeListSubTab === "expired")
            return Math.max(1, (1 + 2 * Simulation.dispatchEngine.expiredList.size) * statsLineHeight);
    }

    if (activeStatsTab === "events")
        return Math.max(1, getCachedEventContentHeight(Simulation.dispatchEngine.eventLog, wrappedTextMaxWidth, normalFont, statsLineHeight, eventGap));

    if (activeStatsTab === "stats")
        return 20 * statsLineHeight;

    return 0;
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
    const backButtonX = panelX + panelWidth - 138;
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

function drawListSubTabs()
{
    const layout = getListSubTabLayout();
    drawButtonRow(layout.startX, listSubTabY, layout.tabWidth, listSubTabHeight, listSubTabGap, layout.items, activeListSubTab, "11px serif", 5, 14);
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
    ctx.fillRect(buttonX, drawY, 74, 20);
    ctx.fillStyle = "#ffffff";
    ctx.font = "13px serif";
    ctx.fillText("Surge +10", buttonX + 8, drawY + 14);
}

function drawTextModeButton(drawY)
{
    const buttonX = statsPanelX + statsPadding;
    ctx.fillStyle = textOnlyMode ? "#ffffff" : "#4f4f4f";
    ctx.fillRect(buttonX, drawY, 120, 20);
    ctx.fillStyle = textOnlyMode ? "#1e1e1e" : "#ffffff";
    ctx.font = "12px serif";
    ctx.fillText("Text only mode", buttonX + 12, drawY + 14);
}

function drawSpeedButtons(tab)
{
    const settingsLayout = getSettingsLayout();
    const startX = statsPanelX + statsPadding + pauseButtonWidth + 6;
    const drawY = (tab === "settings") ? settingsLayout.controlsY : pauseButtonY;
    drawButtonRow(startX, drawY, speedButtonWidth, speedButtonHeight, speedButtonGap, getSpeedButtonItems(), activeSpeedMultiplier);
}

function drawGridSizeButtons()
{
    drawButtonRow(statsPanelX + statsPadding, getSettingsLayout().gridY, gridButtonWidth, speedButtonHeight, gridButtonGap, getGridButtonItems(), size);
}

function drawDriverCountButtons()
{
    const { driverY } = getSettingsLayout();
    const startX = statsPanelX + statsPadding;

    ctx.fillStyle = "#ffffff";
    ctx.font = "12px serif";
    ctx.fillText("Drivers: " + Simulation.driverList.size, startX, driverY + 14);

    ctx.fillStyle = "#4f4f4f";
    ctx.fillRect(startX, driverY + 20, 180, speedButtonHeight);
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Set driver count", startX + 28, driverY + 34);
}

function drawTargetRatioButtons()
{
    const { targetRatioY } = getSettingsLayout();
    const startX = statsPanelX + statsPadding;

    ctx.fillStyle = "#ffffff";
    ctx.font = "12px serif";
    ctx.fillText("Target busy: " + Math.round(targetBusyRatio * 100) + "%", startX, targetRatioY + 14);
    drawButtonRow(startX, targetRatioY + 20, 34, speedButtonHeight, targetRatioButtonGap, getTargetRatioButtonItems(), targetBusyRatio);
}

function drawStatsTabs(tabLayout, tabFont)
{
    const statsTabItems = getStatsTabItems(tabLayout);
    drawButtonRow(tabLayout.listTabX, statsTabY, tabLayout.tabWidth, statsTabHeight, statsTabGap, statsTabItems, activeStatsTab, tabFont, 10, 19);
}

function drawStatsHeaderControls(normalFont)
{
    const settingsLayout = getSettingsLayout();
    ctx.fillStyle = "#ffffff";
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
        drawSurgeButton(settingsLayout.surgeY);
        drawTextModeButton(settingsLayout.textModeY);
        drawPauseButton(settingsLayout.controlsY);
        drawSpeedButtons("settings");
        drawGridSizeButtons();
        drawDriverCountButtons();
        drawTargetRatioButtons();
    }
    else if (activeStatsTab === "stats")
    {
        const batchButtonX = statsPanelX + statsPadding;
        const batchButtonY = statsHeaderY + 8;
        const statsDownloadButtonY = batchButtonY + 28;
        ctx.fillStyle = "#4f4f4f";
        ctx.fillRect(batchButtonX, batchButtonY, 132, 20);
        ctx.fillStyle = "#ffffff";
        ctx.font = "12px serif";
        ctx.fillText("Run Batch", batchButtonX + 28, batchButtonY + 14);
        ctx.fillText("Hours: " + batchTargetHours, batchButtonX + 142, batchButtonY + 14);

        ctx.fillStyle = "#4f4f4f";
        ctx.fillRect(batchButtonX, statsDownloadButtonY, 180, 20);
        ctx.fillStyle = "#ffffff";
        ctx.fillText("Download Event Log", batchButtonX + 20, statsDownloadButtonY + 14);
    }
}

function renderDriverEntries(maybeDrawLine)
{
    let curr = Simulation.driverList.head;
    let done = false;

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

    return done;
}

function renderRiderEntries(maybeDrawLine, riderList)
{
    let curr = riderList.head;
    let done = false;

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

    return done;
}

function renderExpiredEntries(maybeDrawLine)
{
    let expiredCurr = Simulation.dispatchEngine.expiredList.tail;
    let done = false;

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

    return done;
}

function renderListTabContent(maybeDrawLine)
{
    let done = false;

    if (activeListSubTab === "all" || activeListSubTab === "drivers")
    {
        done = maybeDrawLine("Drivers", true);
        if (!done)
            done = renderDriverEntries(maybeDrawLine);
    }

    if (activeListSubTab === "all" || activeListSubTab === "riders")
    {
        if (activeListSubTab === "all" && !done)
            done = maybeDrawLine("");
        if (!done)
            done = maybeDrawLine("Priority Riders", true);
        if (!done)
            done = renderRiderEntries(maybeDrawLine, Simulation.priorityList);

        if (!done)
            done = maybeDrawLine("");
        if (!done)
            done = maybeDrawLine("Non-Priority Riders", true);
        if (!done)
            done = renderRiderEntries(maybeDrawLine, Simulation.riderList);
    }

    if (activeListSubTab === "all")
    {
        if (!done)
            done = maybeDrawLine("");
        if (!done)
            done = maybeDrawLine("Expired Riders", true);
        if (!done)
            renderExpiredEntries(maybeDrawLine);
    }

    if (activeListSubTab === "expired")
    {
        done = maybeDrawLine("Expired Riders", true);
        if (!done)
            renderExpiredEntries(maybeDrawLine);
    }
}

function renderEventsTabContent(viewportTop, activeScrollY, statsViewportHeight, wrappedTextMaxWidth, normalFont, sectionFont, eventGap)
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
        return;
    }

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

function renderStatsTabContent(viewportTop, activeScrollY, statsViewportHeight, sectionFont)
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

function drawStatsScrollbar(viewportTop, statsViewportHeight, maxScroll, activeScrollY)
{
    if (maxScroll <= 0)
        return;

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

function displayStats()
{
    if (!["all", "drivers", "riders", "expired"].includes(activeListSubTab))
        activeListSubTab = "all";

    const normalFont = "16px serif";
    const sectionFont = "bold 20px serif";
    const tabFont = "13px serif";
    const tabLayout = getStatsTabLayout();
    drawStatsTabs(tabLayout, tabFont);
    drawStatsHeaderControls(normalFont);

    const viewportTop = getActiveViewportTop();
    const statsViewportHeight = getStatsViewportHeight();
    const wrappedTextMaxWidth = canvas.width - statsPanelX - (statsPadding * 2) - 16;
    const eventGap = 8;
    statsContentHeight = getStatsContentHeight(wrappedTextMaxWidth, normalFont, eventGap);

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
        renderListTabContent(maybeDrawLine);
    else if (activeStatsTab === "events")
        renderEventsTabContent(viewportTop, activeScrollY, statsViewportHeight, wrappedTextMaxWidth, normalFont, sectionFont, eventGap);
    else if (activeStatsTab === "stats")
        renderStatsTabContent(viewportTop, activeScrollY, statsViewportHeight, sectionFont);
    else
    {
        // Settings tab is controlled by buttons above.
    }

    ctx.restore();
    drawStatsScrollbar(viewportTop, statsViewportHeight, maxScroll, activeScrollY);
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
    ctx.fillRect(downloadButtonX, downloadButtonY, 180, 28);
    ctx.fillStyle = "#ffffff";
    ctx.font = "14px serif";
    ctx.fillText("Download Event Log", downloadButtonX + 20, downloadButtonY + 19);

    const backButtonX = layout.backButtonX;
    const backButtonY = layout.backButtonY;
    ctx.fillStyle = "#4f4f4f";
    ctx.fillRect(backButtonX, backButtonY, 120, 28);
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Back to Sim", backButtonX + 23, backButtonY + 19);
}

function getMousePosition(event)
{
    const rect = canvas.getBoundingClientRect();
    return {
        mouseX: event.clientX - rect.left,
        mouseY: event.clientY - rect.top
    };
}

function handleStatsTabSelection(mouseX, mouseY)
{
    const tabLayout = getStatsTabLayout();
    const selectedTab = getClickedButtonRowValue(
        mouseX,
        mouseY,
        tabLayout.listTabX,
        statsTabY,
        tabLayout.tabWidth,
        statsTabHeight,
        statsTabGap,
        getStatsTabItems(tabLayout)
    );

    if (selectedTab === null)
        return false;

    activeStatsTab = selectedTab;
    return true;
}

function handleListSubTabSelection(mouseX, mouseY)
{
    const subLayout = getListSubTabLayout();
    const selectedSubTab = getClickedButtonRowValue(
        mouseX,
        mouseY,
        subLayout.startX,
        listSubTabY,
        subLayout.tabWidth,
        listSubTabHeight,
        listSubTabGap,
        subLayout.items
    );

    if (selectedSubTab === null)
        return false;

    activeListSubTab = selectedSubTab;
    statsScrollByTab.list = 0;
    return true;
}

function handleSpeedSelection(mouseX, mouseY, drawY)
{
    const selectedSpeed = getClickedButtonRowValue(
        mouseX,
        mouseY,
        statsPanelX + statsPadding + pauseButtonWidth + 6,
        drawY,
        speedButtonWidth,
        speedButtonHeight,
        speedButtonGap,
        getSpeedButtonItems()
    );

    if (selectedSpeed === null)
        return false;

    applySpeedMultiplier(selectedSpeed);
    return true;
}

function onStatsWheel(event)
{
    const { mouseX, mouseY } = getMousePosition(event);
    const viewportTop = getActiveViewportTop();
    const statsViewportHeight = getStatsViewportHeight();
    const maxScroll = Math.max(0, statsContentHeight - statsViewportHeight);

    if (mouseX < statsPanelX || mouseY < viewportTop || mouseY > canvas.height - statsViewportBottomPadding || maxScroll <= 0)
        return;

    statsScrollByTab[activeStatsTab] += Math.sign(event.deltaY) * statsLineHeight;
    statsScrollByTab[activeStatsTab] = Math.max(0, Math.min(statsScrollByTab[activeStatsTab], maxScroll));
    event.preventDefault();
}

function onStatsPanelMouseDown(event)
{
    const { mouseX, mouseY } = getMousePosition(event);
    const settingsLayout = getSettingsLayout();

    if (batchRunDone)
    {
        const layout = getEndSimLayout();

        if (isPointInRect(mouseX, mouseY, layout.downloadButtonX, layout.downloadButtonY, 180, 28))
        {
            downloadEventLog();
            return;
        }

        if (isPointInRect(mouseX, mouseY, layout.backButtonX, layout.backButtonY, 120, 28))
        {
            batchRunDone = false;
            resetFrameTiming();
            return;
        }

        return;
    }

    if (batchRunActive)
        return;

    if (handleStatsTabSelection(mouseX, mouseY))
        return;

    if (activeStatsTab === "list")
    {
        if (handleListSubTabSelection(mouseX, mouseY))
            return;

        if (isPointInRect(mouseX, mouseY, statsPanelX + statsPadding, pauseButtonY, pauseButtonWidth, pauseButtonHeight))
        {
            togglePause();
            return;
        }

        if (handleSpeedSelection(mouseX, mouseY, pauseButtonY))
            return;
    }
    else if (activeStatsTab === "settings")
    {
        if (isPointInRect(mouseX, mouseY, statsPanelX + statsPadding, settingsLayout.surgeY, 74, 20))
        {
            spawnSurgeRiders();
            return;
        }

        if (isPointInRect(mouseX, mouseY, statsPanelX + statsPadding, settingsLayout.textModeY, 120, 20))
        {
            toggleTextOnlyMode();
            return;
        }

        if (isPointInRect(mouseX, mouseY, statsPanelX + statsPadding, settingsLayout.controlsY, pauseButtonWidth, pauseButtonHeight))
        {
            togglePause();
            return;
        }

        if (handleSpeedSelection(mouseX, mouseY, settingsLayout.controlsY))
            return;

        const selectedGridSize = getClickedButtonRowValue(
            mouseX,
            mouseY,
            statsPanelX + statsPadding,
            settingsLayout.gridY,
            gridButtonWidth,
            speedButtonHeight,
            gridButtonGap,
            getGridButtonItems()
        );
        if (selectedGridSize !== null)
        {
            size = selectedGridSize;
            return;
        }

        if (isPointInRect(mouseX, mouseY, statsPanelX + statsPadding, settingsLayout.driverY + 20, 180, speedButtonHeight))
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

        const selectedTargetRatio = getClickedButtonRowValue(
            mouseX,
            mouseY,
            statsPanelX + statsPadding,
            settingsLayout.targetRatioY + 20,
            34,
            speedButtonHeight,
            targetRatioButtonGap,
            getTargetRatioButtonItems()
        );
        if (selectedTargetRatio !== null)
        {
            targetBusyRatio = selectedTargetRatio;
            return;
        }
    }
    else if (activeStatsTab === "stats")
    {
        const batchButtonX = statsPanelX + statsPadding;
        const batchButtonY = statsHeaderY + 8;
        const statsDownloadButtonY = batchButtonY + 28;

        if (isPointInRect(mouseX, mouseY, batchButtonX, batchButtonY, 132, 20))
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

        if (isPointInRect(mouseX, mouseY, batchButtonX, statsDownloadButtonY, 180, 20))
            downloadEventLog();
    }
}



window.onload = setup;
