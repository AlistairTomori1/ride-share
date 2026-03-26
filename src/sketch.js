import SimulationController from "./core/SimulationController.js";
import RideRequest from "./models/RideRequest.js";
import Driver from "./models/Driver.js";
import DispatchEngine from "./core/DispatchEngine.js";
let pause = -1;
let spawnInterval;
let lastSpawnTime;
const Simulation = new SimulationController();
let canvas, ctx;
let riderLength = 0;
let height = 800;
let width = 1200;
let size = 40;
let amenities = ["Child seat", "Pet", "Wheelchair"];

let carImg = new Image();
let carImgBusy = new Image();
carImgBusy.src = "./assets/car-red.png";
carImg.src = "./assets/car-green.png";

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
    Simulation.runSim();

    ctx.fillStyle = "#282828";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(1200, 0, 50, canvas.height);
    drawGrid(size);
    
    if (Simulation.pause == 1)
    {
        if (Math.floor(Math.random() * (1/Simulation.simSpeed * 40000)) == 1)
        {
            spawnRider(riderLength)
            riderLength += 1;
        }
    }
    drawRoute();
    drawDrivers();
    drawRiders();

    displayStats();

    requestAnimationFrame(draw);
}

function spawnRider(id)
{
    let location = [0, 0];
    while (location[0] < size-10 || location[1] < size-10 || location[0] > width - size || location[1] > height - size)
        location = [(size * Math.floor(Math.random() * width/size)), (size * Math.floor(Math.random() * height/size))];

    let passengers = Math.floor(Math.random() * 8) + 1;
    let amenitiesRequired = [];

    for (let i = 0; i < amenities.length; i++)
    {
        if (Math.random() > 0.90)
            amenitiesRequired.push(amenities[i]);
    }

    let dropOff = [0, 0];
    while (dropOff[0] < size-10 || dropOff[1] < size-10 || dropOff[0] > width - size || dropOff[1] > height - size)
        dropOff = [(size * Math.floor(Math.random() * width/size)), (size * Math.floor(Math.random() * height/size))];
    let priority = false;
    if (Math.random < 0.5)
        priority = true;
    let request = new RideRequest(id, location, passengers, amenitiesRequired, dropOff);

    Simulation.addRider(request);
}


function spawnDriver(id)
{

    let location = [0, 0];
    while (location[0] < size-10 || location[1] < size-10 || location[0] > width - size || location[1] > height - size)
        location = [(size * Math.floor(Math.random() * width/size)), (size * Math.floor(Math.random() * height/size))];

    let capacity = Math.floor(Math.random() * 5) + 4;

    let amenitiesAvailable = [];
    for (let i = 0; i < amenities.length; i++)
    {
        if (Math.random() > 0.90)
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
                Simulation.riderList.remove(curr);
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

function displayStats()
{
    ctx.fillStyle = '#ffffff';
    ctx.font = "16px serif";
    ctx.fillText("Time since start: " + Math.floor(Simulation.time/60) + "s", 1280, 80);

    let curr = Simulation.driverList.head;
    let spacing = 30;
    while (curr !== null)
    {
        ctx.fillText(curr.location + " " + curr.state + " $" + curr.profits, 1260, 120 + spacing);
        if (curr.amenities.length > 0)
        {
            spacing += 30;
            ctx.fillText(curr.capacity + " seats, has: " + curr.amenities, 1260, 120 + spacing);
        }
        else 
        {
            spacing += 30;
            ctx.fillText(curr.capacity + " seats", 1260, 120 + spacing);
        }
        curr = curr.next;
        spacing += 30;
    }

    curr = Simulation.riderList.head;
    while (curr !== null)
    {
        ctx.fillText(curr.location + " " + curr.state + " " + Math.floor(curr.waitTimer / 60), 1280, 150 + spacing);
        if (curr.amenitiesRequired.length > 0)
        {
            spacing += 30;
            ctx.fillText(curr.passengers + " people, " + curr.amenitiesRequired + " needed", 1280, 150 + spacing);
        }
        else
        {
            spacing += 30;
            ctx.fillText(curr.passengers + " people, ", 1280, 150 + spacing);

        }
        curr = curr.next;
        spacing += 30;
    }

    // TODO: display completed/expired counts
}

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

document.addEventListener('keydown', function(event) {
    if (event.key === 'p') {
        Simulation.pause += pause;
        pause *= -1;
    }
});



window.onload = function()
{
    setup();
};