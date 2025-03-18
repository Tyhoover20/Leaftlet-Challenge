// Create the 'basemap' tile layer that will be the background of our map.
let basemap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Create the map object with center and zoom options.
let map = L.map('map', {
  center: [39.5, -98.5],
  zoom: 4,
  layers: [basemap]
});

// Then add the 'basemap' tile layer to the map.
basemap.addTo(map);

// Make a request that retrieves the earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {

  // This function returns the style data for each of the earthquakes we plot on the map.
  function styleInfo(feature) {
    return {
      color: getColor(feature.geometry.coordinates[2]),
      radius: getRadius(feature.properties.mag),
      fillColor: getColor(feature.geometry.coordinates[2]),
      fillOpacity: 0.7,
      weight: 0.5
    };
  }

  // This function determines the color of the marker based on the depth of the earthquake.
  function getColor(depth) {
    if (depth > 90) return "red";
    else if (depth > 70) return "orangered";
    else if (depth > 50) return "orange";
    else if (depth > 30) return "gold";
    else if (depth > 10) return "yellow";
    else return "green";
  }

  // This function determines the radius of the earthquake marker based on its magnitude.
  function getRadius(magnitude) {
    return magnitude === 0 ? 1 : magnitude * 4;
  }

  // Add a GeoJSON layer to the map once the file is loaded.
  L.geoJson(data, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },
    style: styleInfo,
    onEachFeature: function (feature, layer) {
      layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
    }
  }).addTo(map);

  // Create a legend control object.
  let legend = L.control({ position: "bottomright" });

  // Then add all the details for the legend
  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");
    let depthIntervals = [-10, 10, 30, 50, 70, 90];
    let colors = ["green", "yellow", "gold", "orange", "orangered", "red"];

    // Loop through our depth intervals to generate a label with a colored square for each interval.
    for (var i = 0; i < depthIntervals.length; i++) {
      div.innerHTML +=
        "<i style='background: " + colors[i] + "'></i> " +
        depthIntervals[i] + (depthIntervals[i + 1] ? "&ndash;" + depthIntervals[i + 1] + "<br>" : "+");
    }

    return div;
  };

  // Finally, add the legend to the map.
  legend.addTo(map);

  // OPTIONAL: Step 2
  // Make a request to get our Tectonic Plate geoJSON data.
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (plate_data) {
    // Save the geoJSON data, along with style information, to the tectonic_plates layer.
    L.geoJson(plate_data, {
      style: {
        color: "orange",
        weight: 2
      }
    }).addTo(map);
  });
});
