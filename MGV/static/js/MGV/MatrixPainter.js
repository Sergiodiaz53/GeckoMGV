/*
 @author Sergio Díaz del Pino
 Multigenome Visualizer
 Bitlab - Universidad de Málaga
 */

//Global Variables//
var matrix = [];
var currentMatrix = [];
var fileType;
var fileName;
var fileNameMAT;
var maxMat = 0;

function logValue(value) {

  var minp = 1;
  var maxp = maxMat;

  var minv = Math.log10(1);
  var maxv = Math.log10(5);

  var scale = (maxv-minv) / (maxp-minp);

  return Math.exp(minv + scale*(value-minp));
}

function log10(val) {
  return Math.log(val) / Math.LN10;
}

function paintMatrix (){

    var w = 500,
        h = 300,
        pad = 20,
        left_pad = 50;

    var svg = d3.select("#matrixSVG")
        .attr("width", w)
        .attr("height", h);


    var x = d3.scale.linear().domain([0,1000]).range([left_pad, w-pad]),
        y = d3.scale.linear().domain([100, 0]).range([pad, h-pad*2]);

    var xAxis = d3.svg.axis().scale(x).orient("bottom"),
        yAxis = d3.svg.axis().scale(y).orient("left");

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0, "+(h-pad)+")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate("+(left_pad-pad)+", 0)")
        .call(yAxis);

    svg.selectAll('circle')
        .data(matrixProcessedData)
        .enter().append("svg:circle")
        .attr("cx", function(d,i){
            return x(d[0]);
        })
        .attr("cy", function(d,i){
            return y(d[1]);
        })
        .attr("r", function(d){return logValue(d[2])})
        .on("mouseover", function(){
        d3.select(this)
            .style("stroke-width", 5)
            .style("stroke", "red");
        })
        .on("mouseout", function(){
            d3.select(this)
                .style("stroke-width", 0)
                .style("stroke", "none")
        })
        .style("fill",function(d) {
            return getHUEColor(d[2]);
        } );

    $('svg circle').tipsy({
        gravity: 'w',
        html: true,
        title: function() {
            var d = this.__data__;
            return d[2];
        }
      });
}

function getHUEColor(value){
    var h, l, s;
    var r, g, b;
    h = Math.log(value)/ Math.log(maxMat);
    l = 0.6;
    s = 0.6;

    function hue2rgb(p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    }

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);

    r = Math.floor(r * 255);
    g = Math.floor(g * 255);
    b = Math.floor(b * 255);

    return rgb(r,g,b);

}