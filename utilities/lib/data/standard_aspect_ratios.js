// common standard aspect ratios
// see https://en.wikipedia.org/wiki/Aspect_ratio_(image)
//
// (portrait modes omitted)

const SARs = [
  {rat: "69/25", desc: "2.76:1 Ultra Panavision 70"},
  {rat: "47/20", desc: "2.35:1 widescreen"},
  {rat: "11/5", desc: "2.2:1 70mm film"},
  {rat: "2/1", desc: "2:1 Univisium"},
  {rat: "37/20", desc: "1.85:1 US widescreen cinema"},
  {rat: "16/9", desc: "16:9 HD video (1.777:1)"},
  {rat: "5/3", desc: "1.66:1 European widescreen, 16mm film"},
  {rat: "3/2", desc: "3:2 still 35mm (1.5:1)"},
  {rat: "143/100", desc: "1.43:1 IMAX"},
  {rat: "4/3", desc: "4:3 SD TV (1.333:1)"},
  {rat: "6/5", desc: "6:5 Fox Movietone (1.2:1)"}
];

module.exports = {SARs};