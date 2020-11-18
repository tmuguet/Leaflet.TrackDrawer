describe('Importing track', () => {
  let map;

  beforeEach(() => {
    map = L.map('map', {
      center: L.latLng(44.96777356135154, 6.06822967529297),
      zoom: 13,
    });
  });

  afterEach(async () => {
    sinon.restore();
    await map.removeAsPromise();
  });

  it('Importing a FeatureCollection with a single Feature should give one line', async () => {
    const track = L.TrackDrawer.track({
      routingCallback(previousMarker, marker, done) {
        throw new Error('Unexpected call');
      },
    }).addTo(map);

    let eventsTriggered = 0;
    track.on('TrackDrawer:done', () => (eventsTriggered += 1));

    const geojson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { hello: 'world' },
          geometry: {
            type: 'LineString',
            coordinates: [[6.064453125000001, 44.974635142416496], [6.098098754882813, 44.95301534523602]],
          },
        },
      ],
    };

    const expectedState = [
      { version: 2, start: [44.974635142416496, 6.064453125000001], metadata: {} },
      [
        {
          end: [44.95301534523602, 6.098098754882813],
          edge: [44.974635142416496, 6.064453125000001, 44.95301534523602, 6.098098754882813],
          metadata: { node: {}, edge: { hello: 'world' } },
        },
      ],
    ];

    await track._dataLoadedHandler(L.geoJSON(geojson), false);
    expect(eventsTriggered).to.be.equal(1);

    const state = track.getState();
    expect(state).to.deep.equal(expectedState);
  });

  it('Importing a FeatureCollection with insertWaypoints=true should give several lines', async () => {
    const track = L.TrackDrawer.track({
      routingCallback(previousMarker, marker, done) {
        throw new Error('Unexpected call');
      },
    }).addTo(map);

    let eventsTriggered = 0;
    track.on('TrackDrawer:done', () => (eventsTriggered += 1));

    /* eslint-disable max-len */
    const geojson = {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        properties: { hello: 'world' },
        geometry: {
          type: 'LineString',
          coordinates: [
            [6.054379, 44.907764, 1293.02], [6.054381, 44.907771, 1293.02], [6.054222, 44.907795, 1292.04], [6.054222, 44.907795, 1292.04], [6.054269, 44.907871, 1292.31], [6.054326, 44.90801, 1292.88], [6.054444, 44.908486, 1293.85], [6.054434, 44.908534, 1293.93], [6.054409, 44.908611, 1293.81], [6.054293, 44.909007, 1294.19], [6.054233, 44.909074, 1294], [6.054148, 44.909141, 1293.69], [6.054016, 44.909227, 1293.43], [6.054016, 44.909227, 1293.43], [6.053941, 44.909243, 1293.49], [6.053843, 44.909248, 1292.67], [6.053715, 44.909237, 1291.93], [6.053606, 44.909197, 1291.13], [6.053458, 44.909153, 1289.96], [6.053316, 44.909116, 1289.07], [6.053229, 44.909112, 1288.68], [6.053147, 44.909127, 1288.3], [6.053013, 44.909174, 1288.1], [6.052983, 44.909189, 1287.92], [6.052908, 44.909227, 1288.07], [6.052859, 44.909242, 1288.53], [6.052782, 44.909261, 1288.4], [6.052669, 44.909278, 1288.91], [6.052545, 44.909288, 1288.82], [6.052355, 44.909293, 1289.03],
          ],
        },
      }],
    };

    const expectedState = [
      {
        version: 2, start: [44.907764, 6.054379], metadata: {},
      },
      [
        {
          end: [44.909007, 6.054293],
          edge: [44.907764, 6.054379, 44.907771, 6.054381, 44.907795, 6.054222, 44.907795, 6.054222, 44.907871, 6.054269, 44.90801, 6.054326, 44.908486, 6.054444, 44.908534, 6.054434, 44.908611, 6.054409, 44.909007, 6.054293],
          metadata: { node: {}, edge: { hello: 'world' } },
        },
        {
          end: [44.909174, 6.053013],
          edge: [44.909007, 6.054293, 44.909074, 6.054233, 44.909141, 6.054148, 44.909227, 6.054016, 44.909227, 6.054016, 44.909243, 6.053941, 44.909248, 6.053843, 44.909237, 6.053715, 44.909197, 6.053606, 44.909153, 6.053458, 44.909116, 6.053316, 44.909112, 6.053229, 44.909127, 6.053147, 44.909174, 6.053013],
          metadata: { node: {}, edge: { hello: 'world' } },
        },
        {
          end: [44.909293, 6.052355],
          edge: [44.909174, 6.053013, 44.909189, 6.052983, 44.909227, 6.052908, 44.909242, 6.052859, 44.909261, 6.052782, 44.909278, 6.052669, 44.909288, 6.052545, 44.909293, 6.052355],
          metadata: { node: {}, edge: { hello: 'world' } },
        },
      ],
    ];
    /* eslint-enable max-len */

    await track._dataLoadedHandler(L.geoJSON(geojson), true);
    expect(eventsTriggered).to.be.equal(1);

    const state = track.getState();
    expect(state).to.deep.equal(expectedState);
  });

  it('Importing a FeatureCollection with a multiple Features should give one line per feature', async () => {
    const track = L.TrackDrawer.track({
      routingCallback(previousMarker, marker, done) {
        throw new Error('Unexpected call');
      },
    }).addTo(map);

    let eventsTriggered = 0;
    track.on('TrackDrawer:done', () => (eventsTriggered += 1));

    const geojson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            index: 0,
          },
          geometry: {
            type: 'LineString',
            coordinates: [[6.064453125000001, 44.974635142416496], [6.098098754882813, 44.95301534523602]],
          },
        },
        {
          type: 'Feature',
          properties: {
            index: 1,
          },
          geometry: {
            type: 'LineString',
            coordinates: [
              [6.098098754882813, 44.95301534523602],
              [6.120929718017578, 44.982406561242584],
              [6.120929718017578, 44.982406561242584],
              [6.075782775878906, 44.98859865651695],
              [6.075782775878906, 44.98859865651695],
              [6.040935516357423, 44.98119234648246],
            ],
          },
        },
      ],
    };

    const expectedState = [
      { version: 2, start: [44.974635142416496, 6.064453125000001], metadata: {} },
      [
        {
          end: [44.95301534523602, 6.098098754882813],
          edge: [44.974635142416496, 6.064453125000001, 44.95301534523602, 6.098098754882813],
          metadata: { node: {}, edge: { index: 0 } },
        },
      ],
      [
        {
          end: [44.98119234648246, 6.040935516357423],
          edge: [44.95301534523602, 6.098098754882813, 44.982406561242584, 6.120929718017578, 44.982406561242584, 6.120929718017578, 44.98859865651695, 6.075782775878906, 44.98859865651695, 6.075782775878906, 44.98119234648246, 6.040935516357423],
          metadata: { node: {}, edge: { index: 1 } },
        },
      ],
    ];

    await track._dataLoadedHandler(L.geoJSON(geojson), false);
    expect(eventsTriggered).to.be.equal(1);

    const state = track.getState();
    expect(state).to.deep.equal(expectedState);
  });

  it('Importing a FeatureCollection with only Points should ignore them', async () => {
    const track = L.TrackDrawer.track({
      routingCallback(previousMarker, marker, done) {
        throw new Error('Unexpected call');
      },
    }).addTo(map);

    let eventsTriggered = 0;
    track.on('TrackDrawer:done', () => (eventsTriggered += 1));

    const geojson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { index: 0 },
          geometry: {
            type: 'Point',
            coordinates: [6.064453125000001, 44.974635142416496],
          },
        },
        {
          type: 'Feature',
          properties: { index: 1 },
          geometry: {
            type: 'Point',
            coordinates: [6.098098754882813, 44.95301534523602],
          },
        },
      ],
    };

    const expectedState = [{ version: 2, start: undefined, metadata: undefined }];

    await track._dataLoadedHandler(L.geoJSON(geojson), false);
    expect(eventsTriggered).to.be.equal(1);

    const state = track.getState();
    expect(state).to.deep.equal(expectedState);
  });

  it('Importing a FeatureCollection with empty coordinates should ignore them', async () => {
    const track = L.TrackDrawer.track({
      routingCallback(previousMarker, marker, done) {
        throw new Error('Unexpected call');
      },
    }).addTo(map);

    let eventsTriggered = 0;
    track.on('TrackDrawer:done', () => (eventsTriggered += 1));

    const geojson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { hello: 'world' },
          geometry: {
            type: 'LineString',
            coordinates: [],
          },
        },
      ],
    };

    const expectedState = [{ version: 2, start: undefined, metadata: undefined }];

    await track._dataLoadedHandler(L.geoJSON(geojson), false);
    expect(eventsTriggered).to.be.equal(1);

    const state = track.getState();
    expect(state).to.deep.equal(expectedState);
  });

  it('Importing GeoJSON data should give a track', async () => {
    const track = L.TrackDrawer.track({
      routingCallback(previousMarker, marker, done) {
        throw new Error('Unexpected call');
      },
    }).addTo(map);

    let eventsTriggered = 0;
    track.on('TrackDrawer:done', () => (eventsTriggered += 1));

    const geojson = `{
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": { "hello": "world" },
          "geometry": {
            "type": "LineString",
            "coordinates": [[6.064453125000001, 44.974635142416496], [6.098098754882813, 44.95301534523602]]
          }
        }
      ]
    }`;

    const expectedState = [
      { version: 2, start: [44.974635142416496, 6.064453125000001], metadata: {} },
      [
        {
          end: [44.95301534523602, 6.098098754882813],
          edge: [44.974635142416496, 6.064453125000001, 44.95301534523602, 6.098098754882813],
          metadata: { node: {}, edge: { hello: 'world' } },
        },
      ],
    ];

    await track.loadData(geojson, 'track', 'geojson', false);
    expect(eventsTriggered).to.be.equal(1);

    const state = track.getState();
    expect(state).to.deep.equal(expectedState);
  });

  it('Importing KML data should give a track', async () => {
    const track = L.TrackDrawer.track({
      routingCallback(previousMarker, marker, done) {
        throw new Error('Unexpected call');
      },
    }).addTo(map);

    let eventsTriggered = 0;
    track.on('TrackDrawer:done', () => (eventsTriggered += 1));

    const kml = '<?xml version="1.0" encoding="UTF-8"?><kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>Hike</name><Placemark><ExtendedData><Data name="hello"><value>world</value></Data></ExtendedData><LineString><coordinates>6.064453125000001,44.974635142416496 6.098098754882813,44.95301534523602</coordinates></LineString></Placemark></Document></kml>';

    const expectedState = [
      { version: 2, start: [44.974635142416496, 6.064453125000001], metadata: {} },
      [
        {
          end: [44.95301534523602, 6.098098754882813],
          edge: [44.974635142416496, 6.064453125000001, 44.95301534523602, 6.098098754882813],
          metadata: { node: {}, edge: { hello: 'world' } },
        },
      ],
    ];

    await track.loadData(kml, 'track', 'kml', false);
    expect(eventsTriggered).to.be.equal(1);

    const state = track.getState();
    expect(state).to.deep.equal(expectedState);
  });

  it('Importing GPX data should give a track', async () => {
    const track = L.TrackDrawer.track({
      routingCallback(previousMarker, marker, done) {
        throw new Error('Unexpected call');
      },
    }).addTo(map);

    let eventsTriggered = 0;
    track.on('TrackDrawer:done', () => (eventsTriggered += 1));

    const gpx = '<gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" version="1.1" creator="map2gpx"><metadata/><trk><name>Track</name><desc>hello world</desc><trkseg><trkpt lat="44.974635142416496" lon="6.064453125000001"></trkpt><trkpt lat="44.95301534523602" lon="6.098098754882813"></trkpt></trkseg></trk></gpx>';

    const expectedState = [
      { version: 2, start: [44.974635142416496, 6.064453125000001], metadata: {} },
      [
        {
          end: [44.95301534523602, 6.098098754882813],
          edge: [44.974635142416496, 6.064453125000001, 44.95301534523602, 6.098098754882813],
          metadata: { node: {}, edge: { name: 'Track', desc: 'hello world' } },
        },
      ],
    ];

    await track.loadData(gpx, 'track', 'gpx', false);
    expect(eventsTriggered).to.be.equal(1);

    const state = track.getState();
    expect(state).to.deep.equal(expectedState);
  });
});
