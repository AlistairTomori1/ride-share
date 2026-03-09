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

let carImg = new Image();
carImg.src = "./assets/car-red.png";

function setup()
{
    canvas = document.getElementById("simCanvas");
    ctx = canvas.getContext("2d");
    canvas.width = width + 275;
    canvas.height = height;

    for (let i = 0; i < 5; i++)
    {
        spawnDriver(i);
    }

    for (let i = 0; i < 5; i++)
        {
            spawnRider(i);
            riderLength += 1;
        }

    console.log(Simulation.driverList);
    console.log(Simulation.riderList);
    draw();

    // TODO: optionally seed initial riders
}

function draw()
{
    Simulation.tick();

    ctx.fillStyle = "#282828";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(1200, 0, 50, canvas.height);
    drawGrid(size);
    
    if (Math.floor(Math.random() * 1000) == 1)
    {
        spawnRider(riderLength)
        riderLength += 1;
    }

    drawDrivers();
    drawRiders();

    displayStats();

    requestAnimationFrame(draw);
}

function spawnRider(id)
{
    let location = [0, 0];
    while (location[0] < size-10 || location[1] < size-10 || location[0] > width - size || location[1] > height - size)
        location = [(size * Math.floor(Math.random() * width/size)) - 10, (size * Math.floor(Math.random() * height/size)) - 10];

    let passengers = Math.floor(Math.random() * 8);

    let amenities = [];

    let dropOff = [0, 0];
    while (dropOff[0] < size-10 || dropOff[1] < size-10 || dropOff[0] > width - size || dropOff[1] > height - size)
        dropOff = [(size * Math.floor(Math.random() * width/size)) - 10, (size * Math.floor(Math.random() * height/size)) - 10];
    let request = new RideRequest(id, location, passengers, amenities, dropOff);

    Simulation.addRider(request);
}


function spawnDriver(id)
{

    let location = [0, 0];
    while (location[0] < size-10 || location[1] < size-10 || location[0] > width - size || location[1] > height - size)
        location = [(size * Math.floor(Math.random() * width/size)), (size * Math.floor(Math.random() * height/size))];

    let capacity = Math.floor(Math.random() * 8 + 4);

    let amenities = [];

    let driver = new Driver(id, location, capacity, amenities);

    Simulation.addDriver(driver);
}

function drawDrivers()
{
    let curr = Simulation.driverList.head;
        while (curr !== null)
        {
            ctx.drawImage(carImg, curr.data.location[0]-10, curr.data.location[1]-20, 40, 40);
            curr = curr.next;
        }

}


function drawRiders()
{
     let curr = Simulation.riderList.head;
        while (curr !== null)
        {
            ctx.fillStyle = "#18cc00";
            ctx.fillRect(curr.data.location[0], curr.data.location[1], 20, 20);
            ctx.fillStyle = "black";
            if (curr.data.state == "MATCHED")
                ctx.fillText(curr.data.assignedDriver.id, curr.data.location[0]+8, curr.data.location[1]+12)
            curr = curr.next;
        }
}

function drawGrid(size)
{
    ctx.strokeStyle = '#3c3c3c'; 
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

function displayStats()
{
    ctx.fillStyle = '#ffffff';
    ctx.font = "20px serif";
    ctx.fillText("Time since start: " + Math.floor(Simulation.time/60) + "s", 1280, 80);

    let curr = Simulation.driverList.head;
    let spacing = 30;
    while (curr !== null)
    {
        ctx.fillText(curr.data.location + " " + curr.data.state, 1280, 120 + spacing);
        curr = curr.next;
        spacing += 30;
    }

    curr = Simulation.riderList.head;
    while (curr !== null)
    {
        ctx.fillText(curr.data.location + " " + curr.data.state, 1280, 120 + spacing);
        curr = curr.next;
        spacing += 30;
    }

    // TODO: display completed/expired counts
}

function mousePressed()
{
    // TODO: optionally spawn rider on click
}

function keyPressed()
{
    // TODO: optionally control simulation speed
}

window.onload = function()
{
    setup();
};