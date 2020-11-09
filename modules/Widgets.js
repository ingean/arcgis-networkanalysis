define([
  "esri/widgets/Search",
  "esri/widgets/Editor",
  "esri/widgets/LayerList",
  "esri/widgets/Expand",
], 
function (
  Search,
  Editor,
  LayerList,
  Expand,
) 
{
  const search = new Search();
  const editor = new Editor();
  const layerList = new LayerList();
  
  return {
    addToView: function(view) {
      //Add widgets
      search.view = view;
      editor.view = view;
      editor.container = document.createElement("div");
      layerList.view = view; 

      const expandEdit = new Expand({
        view: view,
        content: editor
      });

      const expandLayerList = new Expand({
        view: view,
        content: layerList
      });

      view.ui.add(search, "top-right");
      view.ui.add(expandEdit, "top-right");
      view.ui.add(expandLayerList, "top-right");      
    },
 
    geocodeReverse: async function(event) {
      let geocoder = search.activeSource.locator; 
      var params = {
        location: event.mapPoint
      };

      let response = await geocoder.locationToAddress(params).catch(
        error => {
          console.log("Not able to find address for point");
          return null;
        }
      );
      return response.address;
    }
  }
})