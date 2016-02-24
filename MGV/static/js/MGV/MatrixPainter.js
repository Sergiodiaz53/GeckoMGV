/*
 @author Sergio Díaz del Pino
 Multigenome Visualizer
 Bitlab - Universidad de Málaga
 */

//Global Variables//
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

    var svg = d3.select("#matrixSVG")

    var w = parseInt(svg.style("width")),
        h = parseInt(svg.style("height")),
        pad = 40,
        left_pad = 100;

    svg.attr("preserveAspectRatio", "xMinYMin")
        .attr("viewBox","0 0 " + w + " " + h);

    var x = d3.scale.linear().domain([0,currentMatrix.length]).range([left_pad, w-pad]),
        y = d3.scale.linear().domain([currentMatrix[0].length, 0]).range([pad, h-pad*2]);

    var xAxis = d3.svg.axis().scale(x).orient("bottom"),
        yAxis = d3.svg.axis().scale(y).orient("left");

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0, "+(h-pad)+")")
        .call(xAxis);


    svg.append("text")      // text label for the x axis
        .attr("x", w/2 +pad/2 )
        .attr("y",  h-3)
        .style("text-anchor", "middle")
        .text("Length")
        .attr("id", "xAxis");

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate("+(left_pad-pad)+", 0)")
        .call(yAxis);

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 10)
        .attr("x",0 - (h / 2) + pad/2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Identity")
        .attr("id", "yAxis");

    svg.selectAll('circle')
        .data(matrixProcessedData)
        .enter().append("svg:circle")
        .attr("cx", function(d){
            return x(d[0]);
        })
        .attr("cy", function(d){
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
           return (d[1] > coverageLine.coverageValue) ? getHUEColor(d[2]) : rgb(158,158,158);
        } );

    $('svg circle').tipsy({
        gravity: 'w',
        html: true,
        title: function() {
            var d = this.__data__;
            return d[2];
        }
      });

    coverageLine.paint(coverageLine.coverageValue);
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

function changeAxisName(){

    var svg = d3.select("#matrixSVG");

    var xAxisName = $("#xAxisName").val(),
        yAxisName = $("#yAxisName").val(),
        w = parseInt(svg.style("width")),
        h = parseInt(svg.style("height")),
        pad = 40,
        left_pad = 100;

    console.log("Values: "+xAxisName+" -- "+yAxisName);

    svg.select("#xAxis").remove();
    svg.select("#yAxis").remove();

    svg.append("text")      // text label for the x axis
        .attr("x", w/2 +pad/2 )
        .attr("y",  h-3)
        .style("text-anchor", "middle")
        .text(xAxisName)
        .attr("id", "xAxisName");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 10)
        .attr("x",0 - (h / 2) + pad/2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text(yAxisName)
        .attr("id", "yAxisName");

}

function paintFrag(ident, length){

    console.log("Painting Ident: "+ident+" Length: "+length);

    var svg = d3.select("#matrixSVG");

    var w = parseInt(svg.style("width")),
        h = parseInt(svg.style("height")),
        pad = 40,
        left_pad = 100;

    var x = d3.scale.linear().domain([0,currentMatrix.length]).range([left_pad, w-pad]),
        y = d3.scale.linear().domain([currentMatrix[0].length, 0]).range([pad, h-pad*2]);

    svg.append("svg:circle")
        .attr("cx", function(){
            console.log("X: "+x(length));
            return x(length);
        })
        .attr("cy", function(){
            console.log("Y: "+y(length));
            return y(ident);
        })
        .attr("r", 10)
        .style("fill","black");

}

var coverageLine = {

    coverageValue : 50,

    paint : function(coverageValue){

        this.coverageValue = parseInt(coverageValue);

        var svg = d3.select("#matrixSVG");

            var w = parseInt(svg.style("width")),
                h = parseInt(svg.style("height")),
                pad = 40,
                left_pad = 100;

            var x = d3.scale.linear().domain([0,currentMatrix.length]).range([left_pad, w-pad]),
            y = d3.scale.linear().domain([currentMatrix[0].length, 0]).range([pad, h-pad*2]);

            svg.select("#coverageLine").remove();

            var drag = d3.behavior.drag()
                .on("dragstart", dragstarted)
                .on("drag", dragged)
                .on("dragend", dragended);

            var filteringLine = svg.append("line")
                 .attr("x1", x(0)-pad)
                 .attr("y1", y(this.coverageValue))
                 .attr("x2", x(1000))
                 .attr("y2", y(this.coverageValue))
                 .attr("stroke-width", 3)
                 .attr("stroke", "steelblue")
                 .attr("id", "coverageLine")
                 .call(drag);

            function dragstarted() {
              d3.event.sourceEvent.stopPropagation();
              d3.select(this).classed("dragging", true);
             }

            function dragged() {

                coverageLine.coverageValue = y.invert(d3.event.y) > d3.max(y.domain()) ? 100 : y.invert(d3.event.y);

                var newYPositionValue = function() {
                    if(y.invert(d3.event.y) > 100) {
                        return y(100);
                    } else if (y.invert(d3.event.y) < 0) {
                        return y(0);
                    } else {
                        return d3.event.y;
                    }
                }

                filteringLine.attr("y1", newYPositionValue())
                    .attr("y2", newYPositionValue());
            }

            function dragended() {
              d3.select(this).classed("dragging", false);
                var circle = svg.selectAll("circle")
                    .style("fill",function(d) {
                       return (d[1] > coverageLine.coverageValue) ? getHUEColor(d[2]) : rgb(158,158,158);
                    } );
            }
    }
};