define([
  "esri/tasks/ClosestFacilityTask",
  "esri/tasks/support/ClosestFacilityParameters"
], 
function (
  ClosestFacilityTask,
  ClosestFacilityParameters
) 
{
  let closestFacilityTask = new ClosestFacilityTask({
    url: "https://utility.arcgis.com/usrsvcs/appservices/kQDfVzC27SERicV2/rest/services/World/ClosestFacility/NAServer/ClosestFacility_World/solveClosestFacility"
  });

  return {
    execute: function(facilities, incidents, polygonBarriers, timeOfDay, facilityCount) {
      let fcParams = new ClosestFacilityParameters({
        facilities: facilities,
        incidents: incidents,
        polygonBarriers: polygonBarriers,
        travelDirection: 'from-facility',
        timeOfDay: timeOfDay,
        impedance: 'TravelTime',
        defaultTargetFacilityCount: facilityCount
      });
      return closestFacilityTask.solve(fcParams)
    }
  }
})