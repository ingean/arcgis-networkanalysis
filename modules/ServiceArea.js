define([
  "esri/tasks/support/FeatureSet",
  "esri/tasks/ServiceAreaTask",
  "esri/tasks/support/ServiceAreaParameters",
], 
function (
  FeatureSet,  
  ServiceAreaTask,
  ServiceAreaParameters
) 
{
  let serviceAreaTask = new ServiceAreaTask({
    url: "https://utility.arcgis.com/usrsvcs/appservices/gcwKYUizsV5MB3G3/rest/services/World/ServiceAreas/NAServer/ServiceArea_World/solveServiceArea"
  });

  async function executeServiceAreaTask(serviceAreaParams) {
    let result = await serviceAreaTask.solve(serviceAreaParams) 
    if (result.serviceAreaPolygons.length) {
      result.serviceAreaPolygons.forEach(
        graphic => {
          graphic.symbol = areaSymbol
        }
      );
    }
    return result.serviceAreaPolygons;
  }

  return {
    execute: function(stop, polygonBarriers, timeOfDay, outSA) {
      var featureSet = new FeatureSet({
        features: [stop]
      });

      // Set all of the input parameters for the service
      var saParams = new ServiceAreaParameters({
        facilities: featureSet, // Location(s) to start from
        polygonBarriers: polygonBarriers,
        timeOfDay: timeOfDay,
        defaultBreaks: [10], // One or more drive time cutoff values
        outSpatialReference: outSA // Spatial reference to match the view
      });

      return executeServiceAreaTask(saParams);
      }
  }
})