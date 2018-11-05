const colorMap = {
  red: '#D63E2A',
  orange: '#F59630',
  green: '#72B026',
  blue: '#38AADD',
  purple: '#D252B9',
  darkred: '#A23336',
  darkblue: '#0067A3',
  darkgreen: '#728224',
  darkpurple: '#5B396B',
  cadetblue: '#436978',
  lightred: '#FF8E7F',
  beige: '#FFCB92',
  lightgreen: '#BBF970',
  lightblue: '#8ADAFF',
  pink: '#FF91EA',
  white: '#FBFBFB',
  lightgray: '#A3A3A3',
  gray: '#575757',
  black: '#303030',
};
const colors = [
  'blue',
  'green',
  'orange',
  'purple',
  'red',
  'darkblue',
  'darkpurple',
  'lightblue',
  'lightgreen',
  'beige',
  'pink',
  'lightred',
]; // Colors supported by Leaflet AwesomeMarkers

Object.freeze(colorMap);
Object.freeze(colors);

module.exports = {
  nameOf(idx) {
    return colors[idx % colors.length];
  },

  rgbOf(idx) {
    return colorMap[this.nameOf(idx)];
  },

  nameToRgb(name) {
    return colorMap[name];
  },
};
