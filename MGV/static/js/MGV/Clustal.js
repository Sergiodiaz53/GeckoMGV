/**
 * Created by sabega on 23/11/15.
 */

function drawMSA(string){
  var rootDiv = document.getElementById("msa");
  var menuOpts = {};
  var opts = {};

  opts.seqs = msa.io.clustal.parse(string);
  opts.el = document.getElementById("msa");
  opts.vis = {conserv: false, overviewbox: false}
  opts.zoomer = {alignmentHeight: 405, labelWidth: 110,labelFontsize: "13px",labelIdLength: 50}

  console.log(opts.seq);

  var m = new msa.msa(opts);

  menuOpts.el = document.getElementById('menu');
  menuOpts.msa = m;
  var defMenu = new msa.menu.defaultmenu(menuOpts);

  m.addView("menu", defMenu);

	m.render();
}
