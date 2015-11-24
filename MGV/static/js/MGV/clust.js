/**
 * Created by sabega on 23/11/15.
 */


function drawMSA(string){
    var msa = require("msa");

    var clustal=require("biojs-io-clustal");
    var menuDiv = document.getElementById('menu');
    var msaDiv = document.getElementById('msa');
    var opts = {
      el: msaDiv
    };
    opts.conf = {
      dropImport: true,// allow to import sequences via drag & drop
      manualRendering: true
    };
    opts.vis = {
      conserv: false,
      overviewbox: false,
      seqlogo: true,
      metacell: true
    };
    opts.zoomer = {
      labelIdLength: 20
    };

    // init msa
    var m = msa(opts);

    gg = m;
    var seqs=clustal.parse(string)
    m.seqs.reset(seqs)
    var defMenu = new msa.menu.defaultmenu({
    el: menuDiv,
    msa: m
    });
    defMenu.render();
    m.render();
}