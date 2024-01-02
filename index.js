
// const ival_MIN = 1
// const ival_MAX = 10
// const dval_MIN = 1
// const dval_MAX = 100

var __modulesList = [
  // {name: 'module1', js: modulesUrl + 'module1/module1.js', css: modulesUrl + 'module1/module1.css',},
  // {name: 'module2', js: modulesUrl + 'module2/module2.js', css:  modulesUrl + 'module2/module2.css',},
  // {name: 'mminimal', js: modulesUrl + 'mminimal/mminimal.js', css:  modulesUrl + 'mminimal/mminimal.css',},
  // {name: 'mtimer', js: modulesUrl + 'mtimer/mtimer.js', css:  modulesUrl + 'mtimer/mtimer.css',},
]

// ==================================================================
document.addEventListener("DOMContentLoaded", async function () {

  __modulesLoader.doload(__modulesList, __modulesReady)

});

function __modulesReady(){
  console.log('!!! __modulesReady !!!');

  IncludHtml.doIncludAll(
    { // defProps  , "./components/-products.json"
      // preload: ["./components/main.html", "./components/products.html", "./components/about.html",],
      insertType: "replace",
      incInner: false,
      replace: [
        { from: '../img/', to: './img/' },
      ],
      incFromId: "extId",
      // routerParams: routerParams,
    },
    (defProps) => { // вызывается когда IncludHtml.doIncludAll всё сделал 
      setTimeout(function(){
        __modulesList.forEach(el => { el.module.renderAllInstance() })
      }, 1)
    }
  );
}
