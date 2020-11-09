define([
  "esri/tasks/support/FeatureSet",
  "esri/tasks/RouteTask",
  "esri/tasks/support/RouteParameters"
], 
function (
  FeatureSet,
  RouteTask,
  RouteParameters,
) 
{
  let routeTask = new RouteTask({
    url: "https://utility.arcgis.com/usrsvcs/appservices/NO5S32QTaV1CAJjP/rest/services/World/Route/NAServer/Route_World/solve"
  });

  let routeParams = new RouteParameters({
    stops: new FeatureSet(),
    outSpatialReference: {
      wkid: 3857
    },
  });

  return {
    execute: function(stops, returnDirections, startTime, polygonBarriers) {
      routeParams.stops.features = stops;
      routeParams.returnDirections = returnDirections;
      routeParams.directionsLanguage = 'nb';
      routeParams.startTime = startTime; 
      routeParams.polygonBarriers = polygonBarriers;
      if (routeParams.stops.features.length >= 2) { // Solve routing if more than 2 stops
        return routeTask.solve(routeParams)
      }
    }
  }
})