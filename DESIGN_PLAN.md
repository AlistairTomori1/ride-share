Algorithm Design Plan:

Start at top rider in list
    start at top driver in list
        Score the driver by first checking if they have all the required seats, then amenities.
        Next calculate the distance from the driver to the rider.
        Go to next driver and repeat
    assign the driver with the best score to the current rider
    if there are no avalable drivers that meet the requirements for seats and amenities, wait until next tick
    Go to next rider in the list.

If no driver has been assigned to the rider within 10 seconds, expire the ride request.

