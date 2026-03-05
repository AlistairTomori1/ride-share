import SimulationController from "./core/SimulationController.js";

// TODO: define spawn timing variables
let spawnInterval;
let lastSpawnTime;

// TODO: define any canvas/map constants
let canvasWidth;
let canvasHeight;

function setup()
{
    const canvas = document.getElementById("simCanvas");
    const ctx = canvas.getContext("2d");

    // Set size
    canvas.width = 800;
    canvas.height = 600;

    // Optional: background color
    canvas.style.backgroundColor = "#e0e0e0";
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(400, 300, 20, 0, Math.PI * 2);
    ctx.fill();


    // TODO: initialize simulation controller

    // TODO: seed initial drivers

    // TODO: optionally seed initial riders
}


// ===============================
// Main Draw Loop
// ===============================

function draw()
{
    // TODO: advance simulation (sim.tick())

    // TODO: handle rider spawning logic

    // TODO: clear background

    // TODO: draw drivers

    // TODO: draw riders

    // TODO: display simulation stats
}


// ===============================
// Spawning Functions
// ===============================

function spawnRider()
{
    // TODO: generate random location

    // TODO: generate passenger count

    // TODO: generate required amenities

    // TODO: create RideRequest object

    // TODO: add rider to simulation
}


function spawnDriver()
{
    // TODO: generate random location

    // TODO: generate capacity

    // TODO: generate amenities

    // TODO: create Driver object

    // TODO: add driver to simulation
}


// ===============================
// Drawing Functions
// ===============================

function drawDrivers()
{
    // TODO: traverse driver list

    // TODO: determine color based on state

    // TODO: draw driver at location
}


function drawRiders()
{
    // TODO: traverse rider list

    // TODO: determine color based on state

    // TODO: draw rider at location
}


// ===============================
// Utility / Display Functions
// ===============================

function displayStats()
{
    // TODO: display current simulation time

    // TODO: display number of drivers

    // TODO: display number of waiting riders

    // TODO: display completed/expired counts
}


// ===============================
// Optional Interaction Functions
// ===============================

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