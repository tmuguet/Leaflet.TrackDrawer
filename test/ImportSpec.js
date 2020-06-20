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
          properties: {
            index: 0,
          },
          geometry: {
            type: 'LineString',
            coordinates: [[6.064453125000001, 44.974635142416496], [6.098098754882813, 44.95301534523602]],
          },
        },
      ],
    };

    const expectedState = [
      { version: 1, start: [44.974635142416496, 6.064453125000001] },
      [
        {
          end: [44.95301534523602, 6.098098754882813],
          edge: [44.974635142416496, 6.064453125000001, 44.95301534523602, 6.098098754882813],
        },
      ],
    ];

    await track._dataLoadedHandler(L.geoJSON(geojson), false);
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
      { version: 1, start: [44.974635142416496, 6.064453125000001] },
      [
        {
          end: [44.95301534523602, 6.098098754882813],
          edge: [44.974635142416496, 6.064453125000001, 44.95301534523602, 6.098098754882813],
        },
      ],
      [
        {
          end: [44.98119234648246, 6.040935516357423],
          edge: [
            44.95301534523602, 6.098098754882813, 44.982406561242584, 6.120929718017578,
            44.982406561242584, 6.120929718017578, 44.98859865651695, 6.075782775878906,
            44.98859865651695, 6.075782775878906, 44.98119234648246, 6.040935516357423,
          ],
        },
      ],
    ];

    await track._dataLoadedHandler(L.geoJSON(geojson), false);
    expect(eventsTriggered).to.be.equal(1);

    const state = track.getState();
    expect(state).to.deep.equal(expectedState);
  });

  it('Importing a FeatureCollection with Points should ignore them', async () => {
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

    const expectedState = [{ version: 1, start: undefined }];

    await track._dataLoadedHandler(L.geoJSON(geojson), false);
    expect(eventsTriggered).to.be.equal(1);

    const state = track.getState();
    expect(state).to.deep.equal(expectedState);
  });
});
