/* const stopSymbol = {
  type: "simple-marker", 
  style: "cross",
  size: 15,
  outline: {
    width: 4
  }
}; */

const stopSymbol = {
  type: "text", 
  text: "\ue61d", // esri-icon-map-pin
  font: {
    size: 20,
    family: "CalciteWebCoreIcons"
  }
};

const routeSymbol = {
  type: "simple-line", 
  color: [0, 0, 255, 0.5],
  width: 5
};

const areaSymbol = {
  type: "simple-fill",
  color: "rgba(255,50,50,.25)"
};