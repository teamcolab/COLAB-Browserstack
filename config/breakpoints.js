// Breakpoints configuration for visual regression testing
// Each breakpoint has a name, width, height, and optional minHeight for Percy
const breakpoints = [
  {
    name: 'Mobile Portrait',
    width: 414,
    height: 736,
    minHeight: 736
  },
  {
    name: 'Tablet',
    width: 768,
    height: 1024,
    minHeight: 1024
  },
  {
    name: 'Desktop Large',
    width: 1440,
    height: 900,
    minHeight: 900
  }
];

export default breakpoints;
