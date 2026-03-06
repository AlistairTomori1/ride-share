import SimulationController from "./core/SimulationController.js";
import RideRequest from "./models/RideRequest.js";
import Driver from "./models/Driver.js";
import DispatchEngine from "./core/DispatchEngine.js";

let spawnInterval;
let lastSpawnTime;
const Simulation = new SimulationController();
let canvas, ctx;
let riderLength = 0;
function setup()
{
    canvas = document.getElementById("simCanvas");
    ctx = canvas.getContext("2d");
    canvas.width = 800;
    canvas.height = 600;
    canvas.style.backgroundColor = "#e0e0e0";
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(400, 300, 20, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 10; i++)
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

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    //if (Math.floor(Math.random() * 240) == 1)
    //{
        //spawnRider(riderLength)
        //riderLength += 1;
    //}

    drawDrivers();
    drawRiders();

    // TODO: display simulation stats

    requestAnimationFrame(draw);
}

function spawnRider(id)
{
    let location = [Math.floor(Math.random() * 800), Math.floor(Math.random() * 600)];

    let passengers = Math.floor(Math.random() * 8);

    let amenities = [];

    let request = new RideRequest(id, location, passengers, amenities);

    Simulation.addRider(request);
}


function spawnDriver(id)
{

    let location = [Math.floor(Math.random() * 800), Math.floor(Math.random() * 600)];
    
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
            ctx.fillStyle = "#ff0000";
            ctx.fillRect(curr.data.location[0], curr.data.location[1], 25, 25);
            ctx.fillStyle = "black";
            ctx.fillText(curr.data.id, curr.data.location[0], curr.data.location[1])
            curr = curr.next;
        }

}


function drawRiders()
{
     let curr = Simulation.riderList.head;
        while (curr !== null)
        {
            ctx.fillStyle = "#18cc00";
            ctx.fillRect(curr.data.location[0], curr.data.location[1], 25, 25);
            ctx.fillStyle = "black";
            ctx.fillText(curr.data.assignedDriver.id, curr.data.location[0], curr.data.location[1])
            curr = curr.next;
        }
}

function displayStats()
{
    // TODO: display current simulation time

    // TODO: display number of drivers

    // TODO: display number of waiting riders

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