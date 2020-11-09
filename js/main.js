require([
  "https://s3-us-west-1.amazonaws.com/patterns.esri.com/files/calcite-web/1.2.5/js/calcite-web.min.js",
  "esri/intl",
  "esri/WebMap",
  "esri/views/MapView",
  "esri/Graphic",
  "esri/layers/GraphicsLayer",
  "esri/layers/FeatureLayer",
  "esri/tasks/support/FeatureSet",
  "esri/tasks/support/Query", 
  "modules/Widgets.js",
  "modules/Routing.js",
  "modules/ServiceArea.js",
  "modules/ClosestFacility.js"
], function (
  calcite,
  intl,
  WebMap,
  MapView,
  Graphic,
  GraphicsLayer,
  FeatureLayer,
  FeatureSet, 
  Query,
  Widgets,
  Routing,
  ServiceArea,
  ClosestFacility
) {

  // Initialization
  calcite.init();
  intl.setLocale("nb");

  document
  .getElementById('btn-deleteStops')
  .addEventListener('click', deleteAll);

  document
  .getElementById('btn-closestFacility')
  .addEventListener('click', executeClosestFacility);

  document
  .getElementById('check-barriers')
  .addEventListener('change', executeAnalysis);

  document
  .getElementById('check-time')
  .addEventListener('change', executeAnalysis);

  document
  .getElementById('r-route')
  .addEventListener('change', deleteAll);

  document
  .getElementById('r-area')
  .addEventListener('change', deleteAll);

  let t = new Date(Date.now());
  document.getElementById('startTime').value = ('0' + String(t.getHours())).slice(-2) + ':' + ('0' + String(t.getMinutes())).slice(-2);

  var routeLayer = new GraphicsLayer({title: "Resultater"});
  var stopsLayer = new GraphicsLayer({title: "Stoppesteder"});

  let webmap = new WebMap({
    portalItem: {
      id: "d3a6f1ffc7f04f019b0c9abcb3c2f7df"
    }
  });

  webmap.add(routeLayer);
  webmap.add(stopsLayer);

  var view = new MapView({
    container: "viewDiv", // Reference to the scene div created in step 5
    map: webmap, // Reference to the map object created before the scene
  });

  Widgets.addToView(view); //Adds the widgets

  view.on("click", addStop); //Run routing or service area when user clicks in map

  async function addStop(event) {
    let address = await Widgets.geocodeReverse(event);
    addListItem('list-stops', address);
    
    let stop = new Graphic({
      geometry: event.mapPoint,
      symbol: stopSymbol
    });
    stopsLayer.add(stop);

    executeAnalysis();
  }

  function addRoute(route) {
    route.symbol = routeSymbol;
    routeLayer.add(route);
    let drivetime = route.attributes.Total_TravelTime;
    drivetime = minTommss(drivetime) + ' min';
    addListItem('list-routes', drivetime, 'icon-ui-navigation');
  }

  function addDirections(directions) {
    if(directions) {
      directions.features.forEach(f => {
        addListItem(
          'list-directions', 
          formatDirections(f.attributes), 
          '',
          dirImage(f.attributes.maneuverType));
      });
    }
  }

  function deleteAll(event) {
    deleteStops();
    deleteRoutes();
  }
  
  function deleteStops() {
    stopsLayer.removeAll();
    let s = document.getElementById("list-stops");
    s.innerHTML = '';
  }

  function deleteRoutes() {
    routeLayer.removeAll();
    let r = document.getElementById("list-routes");
    r.innerHTML = '';

    let d = document.getElementById("list-directions");
    d.innerHTML = '';
  }

  function executeAnalysis() {
    if(document.getElementById('r-route').checked) {
      executeRouting();
    } else {
      executeSA();
    }
  }

  async function executeRouting() {
    deleteRoutes();
    let stops = [];
    stopsLayer.graphics.forEach(g => {
      stops.push(g);
    });
    
    let result = await Routing.execute(
      stops,
      document.getElementById('check-directions').checked,
      getTime(),
      await getBarriers()
    ).catch(
      error => {console.log("Routing failed")}
    );
    
    addRoute(result.routeResults[0].route);
    addDirections(result.routeResults[0].directions);
  }

  async function executeSA() {
    let stop = stopsLayer.graphics.items[stopsLayer.graphics.length - 1];
    deleteAll();
 
    let serviceAreas = await ServiceArea.execute(stop, getBarriers(), getTime(), view.spatialReference).catch(
      error => {console.log("Service Area failed")}
    );
    
    serviceAreas.forEach(
      graphic => {
        routeLayer.add(graphic,0);
      }
    )
  }
  
  async function executeClosestFacility(event) {
    showLoader('load-closestFacility');
    let result = await ClosestFacility.execute(
      await getFacilities(), 
      await getIncidents(), 
      await getBarriers(), 
      getTime(),
      Number(document.getElementById('input-facilityCount').value)
    ).catch(
      error => {console.log("Closest Facility Failed")}
    );
    
    hideLoader('load-closestFacility');
    routeLayer.removeAll();
    result.routes.forEach(
      function(route, index) {
        addRoute(route);
      });
  }


  function addListItem(listId, content, iconClass = 'icon-ui-map-pin', iconImg = '') {
    let list = document.getElementById(listId);
    let item = document.createElement('div');
    let text = document.createElement('div');
    let icon = document.createElement('div');
    item.className = 'panel-list-item';
    text.className = 'panel-list-text';
    icon.className = iconClass;
    icon.innerHTML = iconImg
    text.innerHTML = content;
    
    item.appendChild(icon);
    item.appendChild(text);
    list.appendChild(item);
  }

  function minTommss(minutes){
    var sign = minutes < 0 ? "-" : "";
    var min = Math.floor(Math.abs(minutes));
    var sec = Math.floor((Math.abs(minutes) * 60) % 60);
    return sign + (min < 10 ? "0" : "") + min + ":" + (sec < 10 ? "0" : "") + sec;
   }

   function formatDirections(a) {
    let dir = a.text
    if (a.length > 0) dir += '<br>' + Math.round(a.length * 10) / 10 + 'km';
    if (a.time > 0) dir += ', ' + minTommss(a.time) + 'min';
    return dir;
  }
  function dirImage(m) {
    return '<img class="img-direction" src="' + gDirectionsLib + gDirections[m] + '" />'
  }

   function getBarriers(){
    if (document.getElementById('check-barriers').checked) {
      return getFeatureSet('AMK_barriers_4346');  
    } else {
      return '';
    }
   }

   function getFacilities() {
    return getFeatureSet('Ambulanser_1109', "status = 'Ledig'");
   }

   function getIncidents() {
    return getFeatureSet('AMK_hendelser_599');
   }


   function getFeatureSet(layerId, where = '1=1', returnGeometry = true, outFields = '*') {
    let fl = webmap.findLayerById(layerId);
    var query = fl.createQuery();
    query.where = where;
    query.returnGeometry = returnGeometry;
    query.outFields = [ outFields ];
    query.outSpatialReference = {wkid: 4326};

    return fl.queryFeatures(query);
   }

   function getTime() {
    if (document.getElementById('check-time').checked) {
      let today = new Date(Date.now());
      let time = document.getElementById('startTime').value;
      return new Date(
       today.getFullYear() + '-' +
       (today.getMonth() + 1)  + '-' +
       today.getDate() + 'T' +
       time + ':00'
       )
    } else {
      return '';
    }
   }

  function showLoader(id) {
    document.getElementById(id)
    .classList.add('is-active');
  }

  function hideLoader(id) {
    document.getElementById(id)
    .classList.remove('is-active');
  }
});
