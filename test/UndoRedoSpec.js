describe('Undo/Redo', () => {
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

  it('undoing and redoing adding first marker', async () => {
    const track = L.TrackDrawer.track({
      routingCallback: (previousMarker, currentMarker, done) => {
        done(null, [previousMarker.getLatLng(), currentMarker.getLatLng()]);
      },
    }).addTo(map);

    await track.addNode(L.TrackDrawer.node(L.latLng(44.974635142416496, 6.064453125000001), { metadata: { node: 1 } }));

    let eventsTriggered = 0;
    track.on('TrackDrawer:done', () => (eventsTriggered += 1));
    await track.undo();

    expect(eventsTriggered).to.be.equal(1);
    expect(track.isUndoable()).to.be.false;
    expect(track.isRedoable()).to.be.true;
    expect(track._currentStateIndex).to.be.equal(0);
    expect(track.getState()).to.deep.equal([{ version: 2, start: undefined, metadata: undefined }]);

    await track.redo();

    expect(eventsTriggered).to.be.equal(2);
    expect(track.isUndoable()).to.be.true;
    expect(track.isRedoable()).to.be.false;
    expect(track._currentStateIndex).to.be.equal(1);
    expect(track.getState()).to.deep.equal([{ version: 2, start: [44.974635142416496, 6.064453125000001], metadata: { node: 1 } }]);
  });

  it('undoing and adding two marker', async () => {
    const track = L.TrackDrawer.track({
      routingCallback: (previousMarker, currentMarker, done) => {
        done(null, [previousMarker.getLatLng(), currentMarker.getLatLng()]);
      },
    }).addTo(map);

    await track.addNode(L.TrackDrawer.node(L.latLng(44.974635142416496, 6.064453125000001), { metadata: { node: 1 } }));
    await track.addNode(L.TrackDrawer.node(L.latLng(44.96777356135154, 6.06822967529297), { metadata: { node: 2 } }));

    const state = track.getState();
    let eventsTriggered = 0;
    track.on('TrackDrawer:done', () => (eventsTriggered += 1));
    await track.undo();

    expect(eventsTriggered).to.be.equal(1);
    expect(track.isUndoable()).to.be.true;
    expect(track.isRedoable()).to.be.true;
    expect(track._currentStateIndex).to.be.equal(1);
    expect(track.getState()).to.deep.equal([{ version: 2, start: [44.974635142416496, 6.064453125000001], metadata: { node: 1 } }]);

    await track.undo();

    expect(eventsTriggered).to.be.equal(2);
    expect(track.isUndoable()).to.be.false;
    expect(track.isRedoable()).to.be.true;
    expect(track._currentStateIndex).to.be.equal(0);
    expect(track.getState()).to.deep.equal([{ version: 2, start: undefined, metadata: undefined }]);

    await track.redo();

    expect(eventsTriggered).to.be.equal(3);
    expect(track.isUndoable()).to.be.true;
    expect(track.isRedoable()).to.be.true;
    expect(track._currentStateIndex).to.be.equal(1);
    expect(track.getState()).to.deep.equal([{ version: 2, start: [44.974635142416496, 6.064453125000001], metadata: { node: 1 } }]);

    await track.redo();

    expect(eventsTriggered).to.be.equal(4);
    expect(track.isUndoable()).to.be.true;
    expect(track.isRedoable()).to.be.false;
    expect(track._currentStateIndex).to.be.equal(2);
    expect(track.getState()).to.deep.equal(state);
  });

  it('undoing while computation is going on should do nothing', async () => {
    const track = L.TrackDrawer.track({
      routingCallback: (previousMarker, currentMarker, done) => {
        setTimeout(() => {
          done(null, [previousMarker.getLatLng(), currentMarker.getLatLng()]);
        }, 1000);
      },
    }).addTo(map);

    await track.addNode(L.TrackDrawer.node(L.latLng(44.974635142416496, 6.064453125000001)));

    let eventsTriggered = 0;
    track.on('TrackDrawer:done', () => (eventsTriggered += 1));
    const promise1 = track.addNode(L.TrackDrawer.node(L.latLng(44.96777356135154, 6.06822967529297)));
    const promise2 = track.undo();
    await Promise.all([promise1, promise2]);

    expect(eventsTriggered).to.be.equal(1);
    expect(track.isUndoable()).to.be.true;
    expect(track.isRedoable()).to.be.false;
    expect(track._currentStateIndex).to.be.equal(2);
  });

  it('undoing and adding new marker should remove redo stack', async () => {
    const track = L.TrackDrawer.track({
      routingCallback: (previousMarker, currentMarker, done) => {
        done(null, [previousMarker.getLatLng(), currentMarker.getLatLng()]);
      },
    }).addTo(map);

    await track.addNode(L.TrackDrawer.node(L.latLng(44.974635142416496, 6.064453125000001)));
    await track.addNode(L.TrackDrawer.node(L.latLng(44.96777356135154, 6.06822967529297)));

    let eventsTriggered = 0;
    track.on('TrackDrawer:done', () => (eventsTriggered += 1));
    await track.undo();

    expect(eventsTriggered).to.be.equal(1);
    expect(track.isUndoable()).to.be.true;
    expect(track.isRedoable()).to.be.true;
    expect(track._currentStateIndex).to.be.equal(1);
    expect(track.getState()).to.deep.equal([{ version: 2, start: [44.974635142416496, 6.064453125000001], metadata: {} }]);

    await track.addNode(L.TrackDrawer.node(L.latLng(44.98859865651695, 6.075782775878906)));

    expect(eventsTriggered).to.be.equal(2);
    expect(track.isUndoable()).to.be.true;
    expect(track.isRedoable()).to.be.false;
    expect(track._currentStateIndex).to.be.equal(2);
  });

  it('undoing with nothing to undo should fail gracefully', async () => {
    const track = L.TrackDrawer.track({
      routingCallback: (previousMarker, currentMarker, done) => {
        done(null, [previousMarker.getLatLng(), currentMarker.getLatLng()]);
      },
    }).addTo(map);

    let eventsTriggered = 0;
    track.on('TrackDrawer:done', () => (eventsTriggered += 1));
    await track.undo();

    expect(eventsTriggered).to.be.equal(0);
    expect(track.isUndoable()).to.be.false;
    expect(track.isRedoable()).to.be.false;
    expect(track._currentStateIndex).to.be.equal(0);
    expect(track.getState()).to.deep.equal([{ version: 2, start: undefined, metadata: undefined }]);
  });

  it('redoing with nothing to redo should fail gracefully', async () => {
    const track = L.TrackDrawer.track({
      routingCallback: (previousMarker, currentMarker, done) => {
        done(null, [previousMarker.getLatLng(), currentMarker.getLatLng()]);
      },
    }).addTo(map);

    let eventsTriggered = 0;
    track.on('TrackDrawer:done', () => (eventsTriggered += 1));
    await track.redo();

    expect(eventsTriggered).to.be.equal(0);
    expect(track.isUndoable()).to.be.false;
    expect(track.isRedoable()).to.be.false;
    expect(track._currentStateIndex).to.be.equal(0);
    expect(track.getState()).to.deep.equal([{ version: 2, start: undefined, metadata: undefined }]);
  });

  it('adding more actions than undoDepth option should remove first items from stack', async () => {
    const track = L.TrackDrawer.track({
      undoDepth: 2,
      routingCallback: (previousMarker, currentMarker, done) => {
        done(null, [previousMarker.getLatLng(), currentMarker.getLatLng()]);
      },
    }).addTo(map);

    await track.addNode(L.TrackDrawer.node(L.latLng(44.97463, 6.064453)));
    expect(track._currentStateIndex).to.be.equal(1);
    await track.addNode(L.TrackDrawer.node(L.latLng(44.97464, 6.064454)));
    expect(track._currentStateIndex).to.be.equal(2);
    await track.addNode(L.TrackDrawer.node(L.latLng(44.97465, 6.064455)));
    expect(track._currentStateIndex).to.be.equal(2);
    await track.addNode(L.TrackDrawer.node(L.latLng(44.97466, 6.064456)));
    expect(track._currentStateIndex).to.be.equal(2);

    let eventsTriggered = 0;
    track.on('TrackDrawer:done', () => (eventsTriggered += 1));

    await track.undo();
    expect(eventsTriggered).to.be.equal(1);
    expect(track._currentStateIndex).to.be.equal(1);
    expect(track.isUndoable()).to.be.true;

    await track.undo();
    expect(eventsTriggered).to.be.equal(2);
    expect(track._currentStateIndex).to.be.equal(0);
    expect(track.isUndoable()).to.be.false;

    await track.undo();
    expect(eventsTriggered).to.be.equal(2);
    expect(track._currentStateIndex).to.be.equal(0);
    expect(track.isUndoable()).to.be.false;
  });

  it('undoing and redoing when undoable option is false should fail gracefully', async () => {
    const track = L.TrackDrawer.track({
      undoable: false,
      routingCallback: (previousMarker, currentMarker, done) => {
        done(null, [previousMarker.getLatLng(), currentMarker.getLatLng()]);
      },
    }).addTo(map);

    await track.addNode(L.TrackDrawer.node(L.latLng(44.974635142416496, 6.064453125000001)));
    expect(track.isUndoable()).to.be.false;
    expect(track.isRedoable()).to.be.false;
    expect(track._currentStateIndex).to.be.null;

    let eventsTriggered = 0;
    track.on('TrackDrawer:done', () => (eventsTriggered += 1));

    await track.undo();
    expect(eventsTriggered).to.be.equal(0);
    expect(track.isUndoable()).to.be.false;
    expect(track.isRedoable()).to.be.false;
    expect(track._currentStateIndex).to.be.null;

    await track.redo();
    expect(track.isUndoable()).to.be.false;
    expect(track.isRedoable()).to.be.false;
    expect(track._currentStateIndex).to.be.null;
  });
});
