/* eslint-disable no-return-assign */
describe('Exporting track', () => {
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

  it('getLatLngs() should return an array of LatLngs for each step', async () => {
    const track = L.TrackDrawer.track({
      routingCallback() {
        throw new Error('Unexpected call');
      },
    }).addTo(map);

    let eventsTriggered = 0;
    track.on('TrackDrawer:done', () => (eventsTriggered += 1));

    const state = [
      { version: 1, start: [44.974635142416496, 6.064453125000001] },
      [
        {
          end: [44.95301534523602, 6.098098754882813],
          edge: [44.974635142416496, 6.064453125000001, 44.95301534523602, 6.098098754882813],
        },
      ],
      [
        {
          end: [44.982406561242584, 6.120929718017578],
          edge: [44.95301534523602, 6.098098754882813, 44.982406561242584, 6.120929718017578],
        },
        {
          end: [44.98859865651695, 6.075782775878906],
          edge: [44.982406561242584, 6.120929718017578, 44.98859865651695, 6.075782775878906],
        },
        {
          end: [44.98119234648246, 6.040935516357423],
          edge: [44.98859865651695, 6.075782775878906, 44.98119234648246, 6.040935516357423],
        },
      ],
      [
        {
          end: [44.962976039238825, 6.023254394531251],
          edge: [44.98119234648246, 6.040935516357423, 44.962976039238825, 6.023254394531251],
        },
      ],
      [
        {
          end: [44.94924926661153, 6.041107177734376],
          edge: [44.962976039238825, 6.023254394531251, 44.94924926661153, 6.041107177734376],
        },
        {
          end: [44.943660436460185, 6.06548309326172],
          edge: [44.94924926661153, 6.041107177734376, 44.943660436460185, 6.06548309326172],
        },
        {
          end: [44.9439034403902, 6.1049652099609375],
          edge: [44.943660436460185, 6.06548309326172, 44.9439034403902, 6.1049652099609375],
        },
      ],
    ];
    const expectedLatLngs = [
      [{ lat: 44.974635142416496, lng: 6.064453125000001 }, { lat: 44.95301534523602, lng: 6.098098754882813 }],
      [
        { lat: 44.95301534523602, lng: 6.098098754882813 },
        { lat: 44.982406561242584, lng: 6.120929718017578 },
        { lat: 44.982406561242584, lng: 6.120929718017578 },
        { lat: 44.98859865651695, lng: 6.075782775878906 },
        { lat: 44.98859865651695, lng: 6.075782775878906 },
        { lat: 44.98119234648246, lng: 6.040935516357423 },
      ],
      [{ lat: 44.98119234648246, lng: 6.040935516357423 }, { lat: 44.962976039238825, lng: 6.023254394531251 }],
      [
        { lat: 44.962976039238825, lng: 6.023254394531251 },
        { lat: 44.94924926661153, lng: 6.041107177734376 },
        { lat: 44.94924926661153, lng: 6.041107177734376 },
        { lat: 44.943660436460185, lng: 6.06548309326172 },
        { lat: 44.943660436460185, lng: 6.06548309326172 },
        { lat: 44.9439034403902, lng: 6.1049652099609375 },
      ],
    ];

    await track.restoreState(state, latlng => L.TrackDrawer.node(latlng));
    expect(eventsTriggered).to.be.equal(1);

    const latlngs = track.getLatLngs();
    expect(latlngs).to.deep.equal(expectedLatLngs);
  });

  it('toGeoJSON() should return a structure with a Feature/LineString for each step', async () => {
    const track = L.TrackDrawer.track({
      routingCallback() {
        throw new Error('Unexpected call');
      },
    }).addTo(map);

    let eventsTriggered = 0;
    track.on('TrackDrawer:done', () => (eventsTriggered += 1));

    const state = [
      { version: 2, start: [44.974635142416496, 6.064453125000001], metadata: { hello: 'world' } },
      [
        {
          end: [44.95301534523602, 6.098098754882813],
          edge: [44.974635142416496, 6.064453125000001, 44.95301534523602, 6.098098754882813],
          metadata: { node: { md1: 1 }, edge: { md2: 2 } },
        },
      ],
      [
        {
          end: [44.982406561242584, 6.120929718017578],
          edge: [44.95301534523602, 6.098098754882813, 44.982406561242584, 6.120929718017578],
          metadata: { node: { md3: 3 }, edge: { md4: 4 } },
        },
        {
          end: [44.98859865651695, 6.075782775878906],
          edge: [44.982406561242584, 6.120929718017578, 44.98859865651695, 6.075782775878906],
          metadata: { node: { md5: 5 }, edge: { md6: 6 } },
        },
        {
          end: [44.98119234648246, 6.040935516357423],
          edge: [44.98859865651695, 6.075782775878906, 44.98119234648246, 6.040935516357423],
          metadata: { node: { md7: 7 }, edge: { md7: 7 } },
        },
      ],
      [
        {
          end: [44.962976039238825, 6.023254394531251],
          edge: [44.98119234648246, 6.040935516357423, 44.962976039238825, 6.023254394531251],
          metadata: { node: { md8: 8 }, edge: { md9: 9 } },
        },
      ],
      [
        {
          end: [44.94924926661153, 6.041107177734376],
          edge: [44.962976039238825, 6.023254394531251, 44.94924926661153, 6.041107177734376],
          metadata: { node: { md10: 10 }, edge: { md11: 11 } },
        },
        {
          end: [44.943660436460185, 6.06548309326172],
          edge: [44.94924926661153, 6.041107177734376, 44.943660436460185, 6.06548309326172],
          metadata: { node: { md12: 12 }, edge: { md13: 13 } },
        },
        {
          end: [44.9439034403902, 6.1049652099609375],
          edge: [44.943660436460185, 6.06548309326172, 44.9439034403902, 6.1049652099609375],
          metadata: { node: { md14: 14 }, edge: { md15: 15 } },
        },
      ],
    ];
    const expectedGeoJson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { index: 0, hello: 'world' },
          geometry: {
            type: 'Point',
            coordinates: [6.064453125000001, 44.974635142416496],
          },
        },
        {
          type: 'Feature',
          properties: { index: 1, md1: 1 },
          geometry: {
            type: 'Point',
            coordinates: [6.098098754882813, 44.95301534523602],
          },
        },
        {
          type: 'Feature',
          properties: { index: 2, md7: 7 },
          geometry: {
            type: 'Point',
            coordinates: [6.040935516357423, 44.98119234648246],
          },
        },
        {
          type: 'Feature',
          properties: { index: 3, md8: 8 },
          geometry: {
            type: 'Point',
            coordinates: [6.023254394531251, 44.962976039238825],
          },
        },
        {
          type: 'Feature',
          properties: { index: 4, md14: 14 },
          geometry: {
            type: 'Point',
            coordinates: [6.1049652099609375, 44.9439034403902],
          },
        },
        {
          type: 'Feature',
          properties: { index: 0, md2: 2 },
          geometry: {
            type: 'LineString',
            coordinates: [[6.064453125000001, 44.974635142416496], [6.098098754882813, 44.95301534523602]],
          },
        },
        {
          type: 'Feature',
          properties: { index: 1, md4: 4 },
          geometry: {
            type: 'LineString',
            coordinates: [
              [6.098098754882813, 44.95301534523602],
              [6.120929718017578, 44.982406561242584],
            ],
          },
        }, {
          type: 'Feature',
          properties: { index: 1, md6: 6 },
          geometry: {
            type: 'LineString',
            coordinates: [
              [6.120929718017578, 44.982406561242584],
              [6.075782775878906, 44.98859865651695],
            ],
          },
        }, {
          type: 'Feature',
          properties: { index: 1, md7: 7 },
          geometry: {
            type: 'LineString',
            coordinates: [
              [6.075782775878906, 44.98859865651695],
              [6.040935516357423, 44.98119234648246],
            ],
          },
        },
        {
          type: 'Feature',
          properties: { index: 2, md9: 9 },
          geometry: {
            type: 'LineString',
            coordinates: [[6.040935516357423, 44.98119234648246], [6.023254394531251, 44.962976039238825]],
          },
        },
        {
          type: 'Feature',
          properties: { index: 3, md11: 11 },
          geometry: {
            type: 'LineString',
            coordinates: [
              [6.023254394531251, 44.962976039238825],
              [6.041107177734376, 44.94924926661153],
            ],
          },
        }, {
          type: 'Feature',
          properties: { index: 3, md13: 13 },
          geometry: {
            type: 'LineString',
            coordinates: [
              [6.041107177734376, 44.94924926661153],
              [6.06548309326172, 44.943660436460185],
            ],
          },
        }, {
          type: 'Feature',
          properties: { index: 3, md15: 15 },
          geometry: {
            type: 'LineString',
            coordinates: [
              [6.06548309326172, 44.943660436460185],
              [6.1049652099609375, 44.9439034403902],
            ],
          },
        },
      ],
    };

    await track.restoreState(state, (latlng, metadata) => L.TrackDrawer.node(latlng, { metadata }));
    expect(eventsTriggered).to.be.equal(1);

    const geojson = track.toGeoJSON(true);
    expect(geojson).to.deep.equal(expectedGeoJson);
  });

  it('toGeoJSON(exportAsFlat = true) should return a structure with a single Feature/LineString', async () => {
    const track = L.TrackDrawer.track({
      routingCallback() {
        throw new Error('Unexpected call');
      },
    }).addTo(map);

    let eventsTriggered = 0;
    track.on('TrackDrawer:done', () => (eventsTriggered += 1));

    const state = [
      { version: 2, start: [44.974635142416496, 6.064453125000001], metadata: { hello: 'world' } },
      [
        {
          end: [44.95301534523602, 6.098098754882813],
          edge: [44.974635142416496, 6.064453125000001, 44.95301534523602, 6.098098754882813],
          metadata: { node: { md1: 1 }, edge: { md2: 2 } },
        },
      ],
      [
        {
          end: [44.982406561242584, 6.120929718017578],
          edge: [44.95301534523602, 6.098098754882813, 44.982406561242584, 6.120929718017578],
          metadata: { node: { md3: 3 }, edge: { md4: 4 } },
        },
        {
          end: [44.98859865651695, 6.075782775878906],
          edge: [44.982406561242584, 6.120929718017578, 44.98859865651695, 6.075782775878906],
          metadata: { node: { md5: 5 }, edge: { md6: 6 } },
        },
        {
          end: [44.98119234648246, 6.040935516357423],
          edge: [44.98859865651695, 6.075782775878906, 44.98119234648246, 6.040935516357423],
          metadata: { node: { md7: 7 }, edge: { md7: 7 } },
        },
      ],
      [
        {
          end: [44.962976039238825, 6.023254394531251],
          edge: [44.98119234648246, 6.040935516357423, 44.962976039238825, 6.023254394531251],
          metadata: { node: { md8: 8 }, edge: { md9: 9 } },
        },
      ],
      [
        {
          end: [44.94924926661153, 6.041107177734376],
          edge: [44.962976039238825, 6.023254394531251, 44.94924926661153, 6.041107177734376],
          metadata: { node: { md10: 10 }, edge: { md11: 11 } },
        },
        {
          end: [44.943660436460185, 6.06548309326172],
          edge: [44.94924926661153, 6.041107177734376, 44.943660436460185, 6.06548309326172],
          metadata: { node: { md12: 12 }, edge: { md13: 13 } },
        },
        {
          end: [44.9439034403902, 6.1049652099609375],
          edge: [44.943660436460185, 6.06548309326172, 44.9439034403902, 6.1049652099609375],
          metadata: { node: { md14: 14 }, edge: { md15: 15 } },
        },
      ],
    ];
    const expectedGeoJson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { index: 0, hello: 'world' },
          geometry: {
            type: 'Point',
            coordinates: [6.064453125000001, 44.974635142416496],
          },
        },
        {
          type: 'Feature',
          properties: { index: 1, md1: 1 },
          geometry: {
            type: 'Point',
            coordinates: [6.098098754882813, 44.95301534523602],
          },
        },
        {
          type: 'Feature',
          properties: { index: 2, md7: 7 },
          geometry: {
            type: 'Point',
            coordinates: [6.040935516357423, 44.98119234648246],
          },
        },
        {
          type: 'Feature',
          properties: { index: 3, md8: 8 },
          geometry: {
            type: 'Point',
            coordinates: [6.023254394531251, 44.962976039238825],
          },
        },
        {
          type: 'Feature',
          properties: { index: 4, md14: 14 },
          geometry: {
            type: 'Point',
            coordinates: [6.1049652099609375, 44.9439034403902],
          },
        },
        {
          type: 'Feature',
          properties: {
            index: 0,
          },
          geometry: {
            type: 'LineString',
            coordinates: [
              [6.064453125000001, 44.974635142416496],
              [6.098098754882813, 44.95301534523602],

              [6.098098754882813, 44.95301534523602],
              [6.120929718017578, 44.982406561242584],
              [6.120929718017578, 44.982406561242584],
              [6.075782775878906, 44.98859865651695],
              [6.075782775878906, 44.98859865651695],
              [6.040935516357423, 44.98119234648246],

              [6.040935516357423, 44.98119234648246],
              [6.023254394531251, 44.962976039238825],

              [6.023254394531251, 44.962976039238825],
              [6.041107177734376, 44.94924926661153],
              [6.041107177734376, 44.94924926661153],
              [6.06548309326172, 44.943660436460185],
              [6.06548309326172, 44.943660436460185],
              [6.1049652099609375, 44.9439034403902],
            ],
          },
        },
      ],
    };

    await track.restoreState(state);
    expect(eventsTriggered).to.be.equal(1);

    const geojson = track.toGeoJSON(true, true);
    expect(geojson).to.deep.equal(expectedGeoJson);
  });

  it('toGeoJSON(false) should not export points', async () => {
    const track = L.TrackDrawer.track({
      routingCallback() {
        throw new Error('Unexpected call');
      },
    }).addTo(map);

    let eventsTriggered = 0;
    track.on('TrackDrawer:done', () => (eventsTriggered += 1));

    const state = [
      { version: 2, start: [44.974635142416496, 6.064453125000001], metadata: { hello: 'world' } },
      [
        {
          end: [44.95301534523602, 6.098098754882813],
          edge: [44.974635142416496, 6.064453125000001, 44.95301534523602, 6.098098754882813],
          metadata: { node: { md1: 1 }, edge: { md2: 2 } },
        },
      ],
      [
        {
          end: [44.982406561242584, 6.120929718017578],
          edge: [44.95301534523602, 6.098098754882813, 44.982406561242584, 6.120929718017578],
          metadata: { node: { md3: 3 }, edge: { md4: 4 } },
        },
        {
          end: [44.98859865651695, 6.075782775878906],
          edge: [44.982406561242584, 6.120929718017578, 44.98859865651695, 6.075782775878906],
          metadata: { node: { md5: 5 }, edge: { md6: 6 } },
        },
        {
          end: [44.98119234648246, 6.040935516357423],
          edge: [44.98859865651695, 6.075782775878906, 44.98119234648246, 6.040935516357423],
          metadata: { node: { md7: 7 }, edge: { md7: 7 } },
        },
      ],
      [
        {
          end: [44.962976039238825, 6.023254394531251],
          edge: [44.98119234648246, 6.040935516357423, 44.962976039238825, 6.023254394531251],
          metadata: { node: { md8: 8 }, edge: { md9: 9 } },
        },
      ],
      [
        {
          end: [44.94924926661153, 6.041107177734376],
          edge: [44.962976039238825, 6.023254394531251, 44.94924926661153, 6.041107177734376],
          metadata: { node: { md10: 10 }, edge: { md11: 11 } },
        },
        {
          end: [44.943660436460185, 6.06548309326172],
          edge: [44.94924926661153, 6.041107177734376, 44.943660436460185, 6.06548309326172],
          metadata: { node: { md12: 12 }, edge: { md13: 13 } },
        },
        {
          end: [44.9439034403902, 6.1049652099609375],
          edge: [44.943660436460185, 6.06548309326172, 44.9439034403902, 6.1049652099609375],
          metadata: { node: { md14: 14 }, edge: { md15: 15 } },
        },
      ],
    ];
    const expectedGeoJson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { index: 0, md2: 2 },
          geometry: {
            type: 'LineString',
            coordinates: [[6.064453125000001, 44.974635142416496], [6.098098754882813, 44.95301534523602]],
          },
        },
        {
          type: 'Feature',
          properties: { index: 1, md4: 4 },
          geometry: {
            type: 'LineString',
            coordinates: [
              [6.098098754882813, 44.95301534523602],
              [6.120929718017578, 44.982406561242584],
            ],
          },
        }, {
          type: 'Feature',
          properties: { index: 1, md6: 6 },
          geometry: {
            type: 'LineString',
            coordinates: [
              [6.120929718017578, 44.982406561242584],
              [6.075782775878906, 44.98859865651695],
            ],
          },
        }, {
          type: 'Feature',
          properties: { index: 1, md7: 7 },
          geometry: {
            type: 'LineString',
            coordinates: [
              [6.075782775878906, 44.98859865651695],
              [6.040935516357423, 44.98119234648246],
            ],
          },
        },
        {
          type: 'Feature',
          properties: { index: 2, md9: 9 },
          geometry: {
            type: 'LineString',
            coordinates: [[6.040935516357423, 44.98119234648246], [6.023254394531251, 44.962976039238825]],
          },
        },
        {
          type: 'Feature',
          properties: { index: 3, md11: 11 },
          geometry: {
            type: 'LineString',
            coordinates: [
              [6.023254394531251, 44.962976039238825],
              [6.041107177734376, 44.94924926661153],
            ],
          },
        }, {
          type: 'Feature',
          properties: { index: 3, md13: 13 },
          geometry: {
            type: 'LineString',
            coordinates: [
              [6.041107177734376, 44.94924926661153],
              [6.06548309326172, 44.943660436460185],
            ],
          },
        }, {
          type: 'Feature',
          properties: { index: 3, md15: 15 },
          geometry: {
            type: 'LineString',
            coordinates: [
              [6.06548309326172, 44.943660436460185],
              [6.1049652099609375, 44.9439034403902],
            ],
          },
        },
      ],
    };

    await track.restoreState(state);
    expect(eventsTriggered).to.be.equal(1);

    const geojson = track.toGeoJSON(false);
    expect(geojson).to.deep.equal(expectedGeoJson);
  });
});
