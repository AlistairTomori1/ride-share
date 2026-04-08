import SimulationController from "./core/SimulationController.js";
import RideRequest from "./models/RideRequest.js";
import Driver from "./models/Driver.js";
import DispatchEngine from "./core/DispatchEngine.js";
let spawnInterval;
let lastSpawnTime;
const Simulation = new SimulationController();
let canvas, ctx;
let riderLength = 0;
let height = 800;
let width = 1200;
let size = 40;
let amenities = ["Child seat", "Pet", "Wheelchair"];
const dividerX = 1200;
const dividerWidth = 12;
const TEXT_ONLY_MODE = false;
const statsPanelX = TEXT_ONLY_MODE ? 0 : dividerX + dividerWidth;
const statsPadding = 10;
const statsTabY = 12;
const statsTabHeight = 28;
const statsTabGap = 6;
const listTabWidth = 165;
const eventsTabWidth = 70;
const statsHeaderY = 80;
const surgeButtonY = statsHeaderY - 14;
const surgeButtonWidth = 74;
const surgeButtonHeight = 20;
const pauseButtonY = statsHeaderY + 8;
const pauseButtonHeight = 20;
const pauseButtonWidth = 90;
const speedButtonGap = 4;
const speedButtonWidth = 34;
const speedButtonHeight = 20;
const speedMultipliers = [0.5, 1, 2, 10];
const statsViewportTop = 110;
const statsViewportBottomPadding = 20;
const statsLineHeight = 24;
let activeStatsTab = "list";
let statsScrollByTab = { list: 0, events: 0 };
let statsContentHeight = 0;
const baseSimulationSpeed = Simulation.simSpeed;
let activeSpeedMultiplier = 1;
let spawnBudget = 0;
let spawnIntergral = 0;
let carImg = new Image();
let carImgBusy = new Image();
carImgBusy.src = "./assets/car-red.png";
carImg.src = "./assets/car-green.png";

function setup()
{
    canvas = document.getElementById("simCanvas");
    ctx = canvas.getContext("2d");
    canvas.width = TEXT_ONLY_MODE ? 420 : width + 275;
    canvas.height = height;

    canvas.addEventListener("wheel", onStatsWheel, { passive: false });
    canvas.addEventListener("mousedown", onStatsPanelMouseDown);

    for (let i = 0; i < 10; i++)
    {
        spawnDriver(i);
    }

    for (let i = 0; i < 10; i++)
        {
            spawnRider(i);
            riderLength += 1;
        }
    draw();
}

function draw()
{
    Simulation.runSim();

    ctx.fillStyle = "#282828";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (!TEXT_ONLY_MODE) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(dividerX, 0, dividerWidth, canvas.height);
        drawGrid(size);
        drawRoute();
        drawDrivers();
        drawRiders();
    }

    displayStats();

    if (Simulation.pause == 1)
        spawnController()

    requestAnimationFrame(draw);
}

function spawnController()
{
    let busyRatio = (Simulation.driverList.size - Simulation.dispatchEngine.availableCount) / Simulation.driverList.size;

    let waitPerDriver = (Simulation.dispatchEngine.waitingCount) / Simulation.driverList.size;

    let rate = Simulation.driverList.size * 0.07;
    rate += (0.85 - busyRatio) * Simulation.driverList.size * 0.22;
    rate -= Math.max(0, waitPerDriver - 0.05) * Simulation.driverList.size * 1.2;

    if (busyRatio > 0.92)
        rate -= (busyRatio - 0.92) * Simulation.driverList.size * 0.9;

    rate = Math.max(0, Math.min(rate, Simulation.driverList.size * 0.25));

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
    let location = [0, 0];
    while (location[0] < size-10 || location[1] < size-10 || location[0] > width - size || location[1] > height - size)
        location = [(size * Math.floor(Math.random() * width/size)), (size * Math.floor(Math.random() * height/size))];

    //let passengers = Math.floor(Math.random() * 8) + 1;
    let passengers = getCount();

    let amenitiesRequired = [];

    for (let i = 0; i < amenities.length; i++)
    {
        if (Math.random() > 0.95)
            amenitiesRequired.push(amenities[i]);
    }

    let dropOff = [0, 0];
    while (dropOff[0] < size-10 || dropOff[1] < size-10 || dropOff[0] > width - size || dropOff[1] > height - size || (dropOff[0] === location[0] && dropOff[1] === location[1]))
        dropOff = [(size * Math.floor(Math.random() * width/size)), (size * Math.floor(Math.random() * height/size))];

    let priority = false;
    if (Math.random() < 0.25)
        priority = true;

    let request = new RideRequest(id, location, passengers, amenitiesRequired, dropOff, priority);

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

    let location = [0, 0];
    while (location[0] < size-10 || location[1] < size-10 || location[0] > width - size || location[1] > height - size)
        location = [(size * Math.floor(Math.random() * width/size)), (size * Math.floor(Math.random() * height/size))];

    let capacity = Math.floor(Math.random() * 5) + 3;

    let amenitiesAvailable = [];
    for (let i = 0; i < amenities.length; i++)
    {
        if (Math.random() > 0.85)
            amenitiesAvailable.push(amenities[i]);
    }

    let driver = new Driver(id, location, capacity, amenitiesAvailable);

    Simulation.addDriver(driver);
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
function displayStats()
{
    const normalFont = "16px serif";
    const sectionFont = "bold 20px serif";
    const tabFont = "13px serif";
    const tabX = statsPanelX + statsPadding;
    const listTabX = tabX;
    const eventsTabX = listTabX + listTabWidth + statsTabGap;

    ctx.font = tabFont;
    if (activeStatsTab === "list")
    {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(listTabX, statsTabY, listTabWidth, statsTabHeight);
        ctx.fillStyle = "#1e1e1e";
        ctx.fillText("Driver/Rider List", listTabX + 10, statsTabY + 19);

        ctx.fillStyle = "#4f4f4f";
        ctx.fillRect(eventsTabX, statsTabY, eventsTabWidth, statsTabHeight);
        ctx.fillStyle = "#ffffff";
        ctx.fillText("Events", eventsTabX + 10, statsTabY + 19);
    }
    else
    {
        ctx.fillStyle = "#4f4f4f";
        ctx.fillRect(listTabX, statsTabY, listTabWidth, statsTabHeight);
        ctx.fillStyle = "#ffffff";
        ctx.fillText("Driver/Rider List", listTabX + 10, statsTabY + 19);

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(eventsTabX, statsTabY, eventsTabWidth, statsTabHeight);
        ctx.fillStyle = "#1e1e1e";
        ctx.fillText("Events", eventsTabX + 10, statsTabY + 19);
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = normalFont;
    ctx.fillText("Time since start: " + Math.floor(Simulation.time/60) + "s", statsPanelX + statsPadding, statsHeaderY);
    drawSurgeButton();
    drawPauseButton();
    drawSpeedButtons();

    const statsViewportHeight = canvas.height - statsViewportTop - statsViewportBottomPadding;
    if (activeStatsTab === "list")
    {
        const totalListLines = 5 + 2 * (Simulation.driverList.size + Simulation.priorityList.size + Simulation.riderList.size);
        statsContentHeight = totalListLines * statsLineHeight;
    }
    else
    {
        const eventCount = Simulation.dispatchEngine.eventLog.log.length;
        statsContentHeight = Math.max(1, eventCount) * statsLineHeight;
    }

    const maxScroll = Math.max(0, statsContentHeight - statsViewportHeight);
    statsScrollByTab[activeStatsTab] = Math.max(0, Math.min(statsScrollByTab[activeStatsTab], maxScroll));
    const activeScrollY = statsScrollByTab[activeStatsTab];
    const firstVisibleLine = Math.max(0, Math.floor(activeScrollY / statsLineHeight));
    const visibleLineCount = Math.ceil(statsViewportHeight / statsLineHeight) + 1;
    const lastVisibleLine = firstVisibleLine + visibleLineCount;

    ctx.save();
    ctx.beginPath();
    ctx.rect(statsPanelX, statsViewportTop, canvas.width - statsPanelX, statsViewportHeight);
    ctx.clip();
    ctx.fillStyle = "#ffffff";

    const drawLine = (lineIndex, text, isSection = false) =>
    {
        if (activeStatsTab === "list" && isSection)
            ctx.font = sectionFont;
        else
            ctx.font = normalFont;
        const y = statsViewportTop + statsLineHeight - activeScrollY + lineIndex * statsLineHeight;
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
        let done = maybeDrawLine("Drivers", true);
        let curr = Simulation.driverList.head;
        while (!done && curr !== null)
        {
            done = maybeDrawLine(curr.location + " " + curr.state + " $" + curr.profits);
            if (done)
                break;

            if (curr.amenities.length > 0)
                done = maybeDrawLine(curr.capacity + " seats, has: " + curr.amenities);
            else
                done = maybeDrawLine(curr.capacity + " seats");

            curr = curr.next;
        }

        if (!done)
            done = maybeDrawLine("");
        if (!done)
            done = maybeDrawLine("Priority Riders", true);

        curr = Simulation.priorityList.head;
        while (!done && curr !== null)
        {
            done = maybeDrawLine(curr.location + " " + curr.state + " " + Math.floor(curr.waitTimer / 60));
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
            done = maybeDrawLine(curr.location + " " + curr.state + " " + Math.floor(curr.waitTimer / 60));
            if (done)
                break;

            if (curr.amenitiesRequired.length > 0)
                done = maybeDrawLine(curr.passengers + " people, " + curr.amenitiesRequired + " needed");
            else
                done = maybeDrawLine(curr.passengers + " people");

            curr = curr.next;
        }
    }
    else
    {
        const eventLines = Simulation.dispatchEngine.eventLog.log;
        if (eventLines.length === 0)
            maybeDrawLine("No events yet");
        else
        {
            for (let i = 0; i < eventLines.length; i++)
            {
                const stop = maybeDrawLine(eventLines[eventLines.length - 1 - i]);
                if (stop)
                    break;
            }
        }
    }

    ctx.restore();

    if (maxScroll > 0)
    {
        const trackX = canvas.width - 10;
        const trackY = statsViewportTop;
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
    const statsViewportHeight = canvas.height - statsViewportTop - statsViewportBottomPadding;
    const maxScroll = Math.max(0, statsContentHeight - statsViewportHeight);

    if (mouseX < statsPanelX || mouseY < statsViewportTop || mouseY > canvas.height - statsViewportBottomPadding || maxScroll <= 0)
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
    const tabX = statsPanelX + statsPadding;
    const listTabX = tabX;
    const eventsTabX = listTabX + listTabWidth + statsTabGap;

    if (mouseY < statsTabY || mouseY > statsTabY + statsTabHeight)
        return;

    if (mouseX >= listTabX && mouseX <= listTabX + listTabWidth)
    {
        activeStatsTab = "list";
        return;
    }

    if (mouseX >= eventsTabX && mouseX <= eventsTabX + eventsTabWidth)
        activeStatsTab = "events";
}

function drawPauseButton()
{
    const buttonX = statsPanelX + statsPadding;
    const label = Simulation.pause === 1 ? "Pause" : "Resume";
    ctx.fillStyle = "#4f4f4f";
    ctx.fillRect(buttonX, pauseButtonY, pauseButtonWidth, pauseButtonHeight);
    ctx.fillStyle = "#ffffff";
    ctx.font = "14px serif";
    ctx.fillText(label, buttonX + 24, pauseButtonY + 14);
}

function drawSurgeButton()
{
    const buttonX = statsPanelX + 150;
    ctx.fillStyle = "#4f4f4f";
    ctx.fillRect(buttonX, surgeButtonY, surgeButtonWidth, surgeButtonHeight);
    ctx.fillStyle = "#ffffff";
    ctx.font = "13px serif";
    ctx.fillText("Surge +10", buttonX + 8, surgeButtonY + 14);
}

function drawSpeedButtons()
{
    const startX = statsPanelX + statsPadding + pauseButtonWidth + 6;
    const labels = ["0.5X", "1X", "2X", "10X"];
    ctx.font = "12px serif";

    for (let i = 0; i < labels.length; i++)
    {
        const buttonX = startX + i * (speedButtonWidth + speedButtonGap);
        if (speedMultipliers[i] === activeSpeedMultiplier)
        {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(buttonX, pauseButtonY, speedButtonWidth, speedButtonHeight);
            ctx.fillStyle = "#1e1e1e";
        }
        else
        {
            ctx.fillStyle = "#4f4f4f";
            ctx.fillRect(buttonX, pauseButtonY, speedButtonWidth, speedButtonHeight);
            ctx.fillStyle = "#ffffff";
        }
        ctx.fillText(labels[i], buttonX + 6, pauseButtonY + 14);
    }
}

function onStatsPanelMouseDown(event)
{
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const buttonX = statsPanelX + statsPadding;
    const surgeButtonX = statsPanelX + 150;
    const speedStartX = buttonX + pauseButtonWidth + 6;

    if (mouseX >= surgeButtonX && mouseX <= surgeButtonX + surgeButtonWidth && mouseY >= surgeButtonY && mouseY <= surgeButtonY + surgeButtonHeight)
    {
        for (let i = 0; i < 10; i++)
        {
            spawnRider(riderLength);
            riderLength += 1;
        }
        return;
    }

    if (mouseX >= buttonX && mouseX <= buttonX + pauseButtonWidth && mouseY >= pauseButtonY && mouseY <= pauseButtonY + pauseButtonHeight)
    {
        Simulation.pause = Simulation.pause === 1 ? 0 : 1;
        return;
    }

    if (mouseY >= pauseButtonY && mouseY <= pauseButtonY + speedButtonHeight)
    {
        for (let i = 0; i < speedMultipliers.length; i++)
        {
            const speedX = speedStartX + i * (speedButtonWidth + speedButtonGap);
            if (mouseX >= speedX && mouseX <= speedX + speedButtonWidth)
            {
                activeSpeedMultiplier = speedMultipliers[i];
                Simulation.simSpeed = baseSimulationSpeed * activeSpeedMultiplier;
                return;
            }
        }
    }

    onStatsTabClick(event);
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
