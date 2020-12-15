/* eslint-disable no-return-assign */
describe('Markers', () => {
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

  it('adding marker', async () => {
    const track = L.TrackDrawer.track({ undoable: false }).addTo(map);
    let eventsTriggered = 0;
    track.on('TrackDrawer:done', () => (eventsTriggered += 1));
    const marker1 = L.TrackDrawer.node(L.latLng(44.974635142416496, 6.064453125000001), { metadata: { marker: 1 } });
    const marker2 = L.TrackDrawer.node(
      L.latLng(44.96777356135154, 6.06822967529297),
      { type: 'stopover', metadata: { marker: 2 } },
    );

    await track.addNode(marker1);
    expect(eventsTriggered).to.be.equal(1);
    expect(track.isUndoable()).to.be.false;
    expect(track.isRedoable()).to.be.false;
    expect(track._currentStateIndex).to.be.null;
    await track.addNode(marker2, (previousMarker, currentMarker, done) => {
      done(null, [previousMarker.getLatLng(), currentMarker.getLatLng()], { edge: 1 });
    });
    expect(eventsTriggered).to.be.equal(2);
    expect(track.isUndoable()).to.be.false;
    expect(track.isRedoable()).to.be.false;
    expect(track._currentStateIndex).to.be.null;

    const expectedNewState = [
      { version: 2, start: [44.974635142416496, 6.064453125000001], metadata: { marker: 1 } },
      [
        {
          end: [44.96777356135154, 6.06822967529297],
          edge: [44.974635142416496, 6.064453125000001, 44.96777356135154, 6.06822967529297],
          metadata: { node: { marker: 2 }, edge: { edge: 1 } },
        },
      ],
    ];

    const newState = track.getState();
    expect(newState).to.deep.equal(expectedNewState);
  });

  it('adding twice same marker should have no effect', async () => {
    const track = L.TrackDrawer.track({ undoable: false }).addTo(map);
    let eventsTriggered = 0;
    track.on('TrackDrawer:done', () => (eventsTriggered += 1));
    const marker1 = L.TrackDrawer.node(L.latLng(44.974635142416496, 6.064453125000001));

    await track.addNode(marker1);
    expect(eventsTriggered).to.be.equal(1);
    await track.addNode(marker1);
    expect(eventsTriggered).to.be.equal(1);

    const expectedNewState = [{ version: 2, start: [44.974635142416496, 6.064453125000001], metadata: {} }];

    const newState = track.getState();
    expect(newState).to.deep.equal(expectedNewState);
  });

  it('adding marker with loss of precision in route', async () => {
    const track = L.TrackDrawer.track({ undoable: false }).addTo(map);
    const marker1 = L.TrackDrawer.node(L.latLng(44.974635142416496, 6.064453125000001));
    const marker2 = L.TrackDrawer.node(L.latLng(44.96777356135154, 6.06822967529297));

    await track.addNode(marker1);
    await track.addNode(marker2, (previousMarker, currentMarker, done) => {
      done(null, [L.latLng(44.974635, 6.06445313), L.latLng(44.967774, 6.06823)]);
    });

    const expectedNewState = [
      { version: 2, start: [44.974635, 6.06445313], metadata: {} },
      [
        {
          end: [44.967774, 6.06823],
          edge: [44.974635, 6.06445313, 44.967774, 6.06823],
          metadata: { node: {}, edge: {} },
        },
      ],
    ];

    const newState = track.getState();
    expect(newState).to.deep.equal(expectedNewState);
  });

  it('adding marker via routingCallback option', async () => {
    const track = L.TrackDrawer.track({
      undoable: false,
      routingCallback: (previousMarker, currentMarker, done) => {
        done(null, [previousMarker.getLatLng(), currentMarker.getLatLng()], { hello: 'world' });
      },
    }).addTo(map);
    const marker1 = L.TrackDrawer.node(L.latLng(44.974635142416496, 6.064453125000001));
    const marker2 = L.TrackDrawer.node(L.latLng(44.96777356135154, 6.06822967529297));

    await track.addNode(marker1);
    await track.addNode(marker2);

    const expectedNewState = [
      { version: 2, start: [44.974635142416496, 6.064453125000001], metadata: {} },
      [
        {
          end: [44.96777356135154, 6.06822967529297],
          edge: [44.974635142416496, 6.064453125000001, 44.96777356135154, 6.06822967529297],
          metadata: { node: {}, edge: { hello: 'world' } },
        },
      ],
    ];

    const newState = track.getState();
    expect(newState).to.deep.equal(expectedNewState);
  });

  it('adding marker via router option', async () => {
    const hasRouting = L.Routing !== undefined;

    if (!hasRouting) {
      L.Routing = {
        waypoint(latlng) {
          return { latLng: latlng };
        },
      };
    }
    const track = L.TrackDrawer.track({
      undoable: false,
      router: {
        route(waypoints, done) {
          const res = [{ coordinates: [waypoints[0].latLng, waypoints[1].latLng] }];
          done(null, res);
        },
      },
    }).addTo(map);
    const marker1 = L.TrackDrawer.node(L.latLng(44.974635142416496, 6.064453125000001), { metadata: { marker: 1 } });
    const marker2 = L.TrackDrawer.node(L.latLng(44.96777356135154, 6.06822967529297), { metadata: { marker: 2 } });

    await track.addNode(marker1);
    await track.addNode(marker2);

    const expectedNewState = [
      { version: 2, start: [44.974635142416496, 6.064453125000001], metadata: { marker: 1 } },
      [
        {
          end: [44.96777356135154, 6.06822967529297],
          edge: [44.974635142416496, 6.064453125000001, 44.96777356135154, 6.06822967529297],
          metadata: { node: { marker: 2 }, edge: {} },
        },
      ],
    ];

    const newState = track.getState();
    expect(newState).to.deep.equal(expectedNewState);

    if (!hasRouting) {
      delete L.Routing;
    }
  });

  it('failure to add a marker should fail gracefully', async () => {
    const track = L.TrackDrawer.track().addTo(map);
    let eventsTriggered = 0;
    let eventsFailureTriggered = 0;
    track.on('TrackDrawer:done', () => (eventsTriggered += 1));
    track.on('TrackDrawer:failed', () => (eventsFailureTriggered += 1));
    const marker1 = L.TrackDrawer.node(L.latLng(44.974635142416496, 6.064453125000001));
    const marker2 = L.TrackDrawer.node(L.latLng(44.96777356135154, 6.06822967529297), { type: 'stopover' });

    await track.addNode(marker1);
    expect(eventsTriggered).to.be.equal(1);
    expect(track.isUndoable()).to.be.true;
    expect(track.isRedoable()).to.be.false;
    await track.addNode(marker2, (previousMarker, currentMarker, done) => {
      done(new Error('error'), null);
    });
    expect(eventsTriggered).to.be.equal(1);
    expect(eventsFailureTriggered).to.be.equal(1);
    expect(track.isUndoable()).to.be.true;
    expect(track.isRedoable()).to.be.false;

    const expectedNewState = [
      { version: 2, start: [44.974635142416496, 6.064453125000001], metadata: {} },
      [
        {
          end: [44.96777356135154, 6.06822967529297],
          edge: [44.974635142416496, 6.064453125000001, 44.96777356135154, 6.06822967529297],
          metadata: { node: {}, edge: {} },
        },
      ],
    ];

    const newState = track.getState();
    expect(newState).to.deep.equal(expectedNewState);
  });
});
