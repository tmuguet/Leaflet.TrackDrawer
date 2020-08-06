describe('Init', () => {
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

  it('constructor should correctly initialize structures', () => {
    const track = L.TrackDrawer.track().addTo(map);
    const state = track.getState();
    expect(state).to.be.an('array');
    expect(state).to.be.deep.equal([{ version: 2, start: undefined, metadata: undefined }]);
    expect(track.isUndoable()).to.be.false;
    expect(track.isRedoable()).to.be.false;
    expect(track._currentStateIndex).to.be.equal(0);

    const track2 = L.TrackDrawer.track({ undoable: false }).addTo(map);
    expect(track2.isUndoable()).to.be.false;
    expect(track2.isRedoable()).to.be.false;
    expect(track2._currentStateIndex).to.be.null;
  });
});
