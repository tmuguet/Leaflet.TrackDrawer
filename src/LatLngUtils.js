const L = require('leaflet');

/**
 * Splits an array of LatLng objects every X meters
 * @param {L.LatLng[]} latlngs Polyline to split
 * @param {int} distance Max. distance of each segment of the polyline (in meters)
 * @returns L.LatLng[][]
 */
function splitLatLngs(latlngs, distance = 100) {
  if (distance <= 0) throw new Error('`distance` must be positive');
  if (latlngs.length === 0) return [[]];

  let result = [];
  if (Array.isArray(latlngs[0])) {
    for (let j = 0; j < latlngs.length; j += 1) {
      result = result.concat(splitLatLngs(latlngs[j], distance));
    }

    return result;
  }

  let tmp = latlngs.splice(0, 1);
  while (latlngs.length > 0) {
    const latlng = L.latLng(latlngs.splice(0, 1)[0]);
    tmp.push(latlng);
    if (latlng.distanceTo(tmp[0]) > distance) {
      result.push(tmp);
      tmp = [latlng];
    }
  }
  result.push(tmp);

  return result;
}

/**
 * Splits a L.Polyline object every X meters
 * @param {L.Polyline} polyline Polyline to split
 * @param {int} distance Max. distance of each segment of the polyline (in meters)
 * @returns L.Polyline[]
 */
function splitPolyline(polyline, distance = 100) {
  return splitLatLngs(polyline.getLatLngs(), distance).map(a => L.polyline(a));
}

function featureGroupToPolylines(featureGroup) {
  return featureGroup.getLayers().filter(layer => layer instanceof L.Polyline);
}

function featureGroupToLatLngs(featureGroup) {
  return featureGroupToPolylines(featureGroup).map(layer => layer.getLatLngs());
}

module.exports = {
  splitPolyline,
  splitLatLngs,
  featureGroupToPolylines,
  featureGroupToLatLngs,
};
