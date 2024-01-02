// IncludHtml.js

let DO_LOG = false

const _fnLog = function (...params) {
  let n = 0
  return (...params) => {
    if (DO_LOG) console.log(++n + '.', ...params)
  }
}()
const log = (...params) => _fnLog(...params)

let IncludHtml = (function () {
  let _finish_callback = false;
  let _defProps = false;
  let _selectorClass = "incs";
  let _root = document;
  let _currentCall = ''
  let routes = []
  // this._routerCreated = false;

  const _jsParse = (str) => {
    return (new Function('return ' + str))(str)
  }
  const _parseBool = (val) => { return val === true || val === "true" || val === "True" }
  async function _doSingleFetch(url) {
    const r = await fetch(url)
    if (!r.ok)
      return { url: url, ok: false, txt: r.status + ' ' + r.statusText, }
    const txt = await r.text()
    return { url: url, ok: true, txt: txt, }
  }
  async function _doArrayFetch(urls) {
    const rs = urls.map(url => _doSingleFetch(url))
    return await Promise.all(rs)
  }


  function doIncludAll(defProps, finish_callback = false) {
    _currentCall = 'doIncludAll'
    // log('-----------', _currentCall)
    _root = document;
    if (typeof defProps === 'object') {
      _defProps = defProps;
    } else if (typeof defProps === 'function') {
      _finish_callback = defProps;
    }
    if (typeof finish_callback === 'function') {
      _finish_callback = finish_callback;
    }
    if (_defProps.preload) {
      doPreload(_defProps.preload,
        () => {
          log('doPreload ready')
          _doIncludAll(_doIncludAll);
        })
    } else {
      _doIncludAll(_doIncludAll);
    }
  }

  function doInsertInto(el, finish_callback = false) { // , defProps
    _currentCall = 'doInsertInto'
    // log('-----------', _currentCall)
    _finish_callback = finish_callback;
    _root = el;
    _doIncludAll(_doIncludAll, el);
  }

  function _doIncludAll(doContinue, el) {
    if (!el) {
      let incs = _root.querySelectorAll("." + _selectorClass);
      // log("_doIncludAll - incs.length:", incs.length);
      if (incs.length <= 0) {
        if (_finish_callback) {
          _finish_callback(_defProps)
          _finish_callback = false
        }
        if (_defProps.routerParams)
          _CreateRouter(_defProps.routerParams)
        return;
      }
      el = incs[0]
    }
    try {
      _doIncludSingle(el, doContinue);
    } catch (e) {
      console.error("_doIncludSingle catch(e):", e);
    }
    // let incs = []
    // if(!el){
    //   incs = _root.querySelectorAll("." + _selectorClass);
    //   log("_doIncludAll - incs.length:", incs.length);
    //   if (incs.length <= 0) {
    //     if (_finish_callback) _finish_callback();
    //     requestCache = [];
    //     return;
    //   }
    // }else{
    //   incs.push(el)
    // }
    // try {
    //   _doIncludSingle(incs[0], doContinue);
    // } catch (e) {
    //   console.error("_doIncludSingle catch(e):", e);
    // }
  }
  function _doIncludSingle(el, doContinue) {
    let params = el.dataset.incs;
    // debugger
    el.classList.remove(_selectorClass);
    // el.removeAttribute("data-incs");
    if (!params) {
      console.error("IncludHtml - нет json параметров");
      return;
    }
    try {
      params = _jsParse(params) // JSON.parse(params);
    } catch (e) {
      console.error("Не удалось разобрать параметры!", e, "data-incs=\r\n", params);
    }
    if (routes['%pageParams%']) {
      let pp = routes['%pageParams%'].replaceAll('/', '')
      params.incFile = params.incFile
        .replaceAll(('%routePage%'), routes['%routePage%'])
        .replaceAll(('%pageParams%'), pp)
        ;
    }
    let incFromId = false;
    if (!params.incFromId && params.incFile.indexOf('#') >= 0) {
      incFromId = params.incFile.split('#')[1].trim()
    } else {
      incFromId = _defProps && _defProps.incFromId ? _defProps.incFromId : incFromId;
      incFromId = params && params.incFromId ? params.incFromId : incFromId;
    }
    if(incFromId === false) incFromId = 'extId'

    // let errSt = !params;
    // errSt = errSt || !incFromId
    if (incFromId && params) {
      // params.incFromId
      // params.incFile
      // params.onLoadCallback
      params.docEl = el;
      params.extEl = null;
      params.extUrl = null;
      if (!params.incFile) {
        // вставка элемента из текущего документа
        const docElement = document.getElementById(incFromId);
        if (docElement) {
          const extEl = docElement.cloneNode(true);
          extEl.removeAttribute("id");
          params.extEl = extEl;
          _doProcess(params, doContinue);
        } else {
          console.error("IncludHtml - не найден элемент с указанным id:", incFromId);
        }
      } else {
        // вставка элемента из документа внешнего html файла
        let url = params.incFile;
        url = url.replaceAll('%routePage%', routes['%routePage%'] ?? '')
        url = url.replaceAll('%pageParams%', routes['%pageParams%'] ?? '')
        log('_doIncludSingle url: ', url, 'params.incFile: ', params.incFile);
        if (!url) {
          console.error("IncludHtml - не задана extUrl");
          return;
        }
        fetchOrCache(url, incFromId, (extEl) => {
          params.extEl = extEl;
          _doProcess(params, doContinue);
        });
      }
    }
  }
  const requestCache = [];
  function fetchOrCache(url, incFromId, callback) {
    // debugger
    if (url.indexOf('#') >= 0) {
      url = url.split('#')[0].trim()
    }
    if (requestCache[url]) {
      try {
        const el = requestCache[url].getElementById(incFromId)
        if (!el)
          throw `элемент не найден ${url} - ${incFromId}`
        const extEl = el.cloneNode(true);
        extEl.removeAttribute("id");
        callback(extEl);
      } catch (e) {
        console.error("Ошибка при обработке документа в requestCache:", e)
      }
    } else {
      log('+++++fetch url: ', url, incFromId) //, callback)
      fetch(url)
        .then((response) => {
          if (response.ok) {
            return response.text();
          }
        })
        .then((data) => {
          if (data) {
            // log('\\\+++++fetch url: ', url, incFromId)
            const parser = new DOMParser(),
              content = "text/html",
              DOM = parser.parseFromString(data, content);
            requestCache[url] = DOM.cloneNode(true);
            const extEl = DOM.getElementById(incFromId); // DOM.body.querySelector('.'+pparams.incClass);

            // const DOM = document.createElement("div");
            // DOM.insertAdjacentHTML("afterbegin", data);
            // // const node = placeholder.firstElementChild;
            // const extEl = DOM.querySelector('#' + incFromId) // DOM.getElementById(incFromId);

            if (extEl) {
              extEl.removeAttribute("id");
              callback(extEl);
            } else {
              console.error("Не найден элемент с id: " + incFromId + "\r\nВ файле: ", url);
            }
          } else {
            console.error('Не получены данные в результате запроса:', url)
          }
        })
        .catch((error) => {
          console.error("Fetch error: ", error);
        })
        ;
    }
  }
  function _doProcess(params, doContinue) {
    let insertType = "";
    let incInner = true;
    let replace = [];

    let summParams = { insertType: insertType, incInner: incInner, }
    Object.assign(summParams, _defProps)
    Object.assign(summParams, params)
    insertType = summParams.insertType ? summParams.insertType : insertType;
    incInner = typeof (summParams.incInner) === 'boolean' ? summParams.incInner : incInner;

    // // if(params && typeof(params.incInner) === 'boolean'){
    // //   incInner = params.incInner
    // // } else {
    // //   incInner = _defProps && typeof(_defProps.incInner) === 'boolean' ? _defProps.incInner : incInner;
    // // }
    //
    // insertType = _defProps && _defProps.insertType ? _defProps.insertType : insertType;
    // incInner = _defProps && typeof (_defProps.incInner) === 'boolean' ? _defProps.incInner : incInner;
    //
    // if (params) {
    //   insertType = params.insertType ? params.insertType : insertType;
    //   // if(typeof(params.incInner) === 'string'){
    //   //   params.incInner = (params.incInner).trim().toLowerCase()
    //   //   if(params.incInner === "true")
    //   //     params.incInner = true
    //   //   if(params.incInner === "false")
    //   //     params.incInner = false
    //   // }
    //   if(params.incInner !== undefined) params.incInner = _parseBool(params.incInner)
    //   incInner = typeof (params.incInner) === 'boolean' ? params.incInner : incInner;
    // }

    if (_defProps && _defProps.replace) {
      replace = !Array.isArray(_defProps.replace)
        ? (replace = replace.concat([_defProps.replace]))
        : (replace = replace.concat(_defProps.replace));
    }
    if (params && params.replace) {
      replace = !Array.isArray(params.replace)
        ? (replace = replace.concat([params.replace]))
        : (replace = replace.concat(params.replace));
    }
    if (replace && replace.length > 0) {
      replace.forEach((r) => {
        try {
          if (r.from && r.to) {
            const reg = new RegExp(r.from, "ig");
            const str = params.extEl.innerHTML;
            params.extEl.innerHTML = str.replace(reg, r.to);
          } else {
            console.warn('"from" и "to" обязательны в елементе "replace" ');
          }
        } catch (e) {
          console.warn("ошибка при выполнении замены r:", r, "err:", e);
        }
      });
    }
    if (routes['%routePage%']) {
      const pp = routes['%routePage%'].replaceAll('/', '_')
      params.extEl.innerHTML = params.extEl.innerHTML.replaceAll('%routePage%', pp)
    } else {
      params.extEl.innerHTML = params.extEl.innerHTML.replaceAll('%routePage%', '')
    }
    if (routes['%pageParams%']) {
      const pp = routes['%pageParams%'].replaceAll('/', '_')
      params.extEl.innerHTML = params.extEl.innerHTML.replaceAll('%pageParams%', pp)
    } else {
      params.extEl.innerHTML = params.extEl.innerHTML.replaceAll('%pageParams%', '')
    }

    const cb = params.onLoadCallback;
    if (cb) {
      const handler = (typeof (cb) === 'function') ? cb : eval(`(p)=>{ ${cb}(p); }`);
      Object.assign(params, { routePage: routes['%routePage%'], pageParams: routes['%pageParams%'], })
      try {
        handler(params);
      } catch (e) {
        console.warn("catch error in call " + cb + "(params)", e);
      }
    }

    // const incs = params.extEl.querySelectorAll('.'+ _selectorClass);
    // if(incs.length > 0){
    //   console.error("Рекурсивное вставление элементов пока не работает")
    //   // debugger;
    // }

    // debugger
    // log('++++++++', _currentCall);
    if (_currentCall !== 'doIncludAll') {
      // log(_currentCall , "(_currentCall != 'doIncludAll')")
      incInner = true;
      // insertType = 'replace';
      _currentCall = 'doIncludAll'
    }
    if (insertType && insertType === "append") {
      // params.docEl.append(params.extEl);
      if (incInner) {
        // params.docEl.outerHTML = params.extEl.innerHTML;
        params.docEl.innerHTML += params.extEl.innerHTML;
      } else {
        // params.docEl.replaceWith(params.extEl);
        params.docEl.innerHTML += params.extEl.outerHTML;
      }

    } else if (insertType && insertType === "prepend") {
      // params.docEl.prepend(params.extEl);
      if (incInner) {
        // params.docEl.outerHTML = params.extEl.innerHTML;
        params.docEl.innerHTML = params.extEl.innerHTML + params.docEl.innerHTML;
      } else {
        // params.docEl.replaceWith(params.extEl);
        params.docEl.innerHTML = params.extEl.outerHTML + params.docEl.innerHTML;
      }

    } else { // заменяем всё содержимое на innerHTML или outerHTML вставляемого
      if (incInner) {
        // params.docEl.outerHTML = params.extEl.innerHTML;
        params.docEl.outerHTML = params.extEl.innerHTML;
      } else {
        // params.docEl.replaceWith(params.extEl);
        params.docEl.outerHTML = params.extEl.outerHTML;
      }
    }

    doContinue(doContinue);
    // _doIncludAll();
  }

  let hashChangeHandlerExt = false;
  let paramChangeHandlerExt = false;
  let localLinkHandlerExt = false;
  let urlsExt = false
  function _CreateRouter({ urls, hashChangeHandler, paramChangeHandler, localLinkHandler }) {
    // log('_CreateRouter', routes, hashChangeHandler, paramChangeHandler)
    if (hashChangeHandlerExt)
      return
    log('----------_CreateRouter????')

    hashChangeHandlerExt = hashChangeHandler
    paramChangeHandlerExt = paramChangeHandler
    localLinkHandlerExt = localLinkHandler
    urlsExt = urls
    for (const el of urls) {
      routes[el.url] = el
    }
    // вспомогательные 👇
    routes['%lastHash%'] = '';
    routes['%lastHash0%'] = '';
    routes['%routePage%'] = ''; // 'page-index/main.html#'; // 👈 используется при загрузке части стр.
    routes['%pageParams%'] = ''

    _hashchangeHandler();
    window.addEventListener('hashchange', _hashchangeHandler);
    // this._routerCreated = true
  }
  const _hashchangeHandler = () => {
    let curHash = location.hash.replaceAll('#', '')
    curHash = (curHash === '' ? routes[''].hash : curHash)
    let curHash0 = curHash.split('/')[0]
    curHash0 = curHash // не разделяем hash и параметры

    if (curHash.startsWith('!')) {
      let pageParams = curHash.split('/').reduce((s, el, i) => { return i > 0 ? s + '/' + el : s; }, '')
      if (location.hash.replaceAll('#', '') !== curHash) {
        routes['%lastHash%'] = curHash
        routes['%lastHash0%'] = curHash0
        log('set location.hash = curHash:', curHash)
        window.history.replaceState({}, null, location.href.split('#')[0] + '#' + curHash);
      }
      let includ_url = ''
      let def_param = ''
      try {
        if (!routes[curHash0]) {
          console.error('Unsupported route:' + curHash0)
          window.history.replaceState({}, null, location.href.split('#')[0] + '#' + routes['%lastHash%']);
          return
        }
        pageParams = routes[curHash0].hash.split('/').reduce((s, el, i) => { return i > 0 ? s + '/' + el : s; }, '')
        includ_url = routes[curHash0].includ_url
        if (!includ_url) {
          throw 'unsupported route [' + curHash0 + ']'
        }
        if (routes[curHash0].def_param)
          def_param = routes[curHash0].def_param
      } catch (e) {
        console.error('IncludHtml.routes["' + curHash0 + '"].includ_url\r\n', e)
        window.history.replaceState({}, null, location.href.split('#')[0] + '#' + routes['%lastHash%']);
        return;
      }
      routes['%lastHash%'] = curHash
      routes['%lastHash0%'] = curHash0
      pageParams = pageParams || def_param
      let pageParamsChanged = routes['%pageParams%'] !== pageParams;
      routes['%pageParams%'] = pageParams
      if (routes['%routePage%'] !== includ_url) {
        // log('Render content for INCLUD url:', includ_url, ' prev INCLUD url:', IncludHtml.routes['%routePage%'], 'pageParams:', IncludHtml.routes['%pageParams%'])
        routes['%routePage%'] = includ_url
        hashChangeHandlerExt && hashChangeHandlerExt(urlsExt, routes[curHash0], routes['%pageParams%']);
      } else {
        if (pageParamsChanged) {
          // log("pageParamsChanged '%pageParams%': ", IncludHtml.routes['%pageParams%']);
          paramChangeHandlerExt && paramChangeHandlerExt(urlsExt, routes[curHash0], routes['%pageParams%'])
          hashChangeHandlerExt && hashChangeHandlerExt(urlsExt, routes[curHash0], routes['%pageParams%']);
        }
      }
    } else {
      // log('Link to Inner ref: ' + location.hash)
      const link = location.hash
      window.history.replaceState({}, null, location.href.split('#')[0] + '#' + routes['%lastHash%']);
      localLinkHandlerExt && localLinkHandlerExt(urlsExt, routes[routes['%lastHash0%']], routes['%pageParams%'], link)
    }
  }

  async function _preloadIncluds(urls) {
    const rs = await _doArrayFetch(urls)
    rs.forEach(el => {
      if (el.ok) {
        let url = el.url.toLowerCase()
        if (url.endsWith('.json')) {
          requestCache[url] = JSON.parse(el.txt)
        } else if (url.includes('.htm')) {
          const parser = new DOMParser(),
            content = "text/html",
            DOM = parser.parseFromString(el.txt, content);
          requestCache[url] = DOM.cloneNode(true);
        } else {
          requestCache[url] = el.txt;
        }
      } else {
        console.warn('url: ', el.url, el.txt);
      }
    })
  }
  async function doPreload(urls, onReadyPreload) {
    await _preloadIncluds(urls)
    if (onReadyPreload) onReadyPreload()
  }

  function markSelectedLink(urls, urlObj, className, selectedClassName) {
    let defUrl = false
    for (const el of urls) {
      if (el.url === "") {
        defUrl = el.hash; break
      }
    }
    document.querySelectorAll('.' + className).forEach(el => el.classList.remove(selectedClassName))
    {
      const selector = `a[href='#${urlObj.hash}']`
      const selectedHrefs = document.querySelectorAll(selector)
      selectedHrefs.forEach(el => el.parentElement.classList.add(selectedClassName))
    }
    if (defUrl === urlObj.hash) {
      const selector = `a[href='#']`
      const selectedHrefs = document.querySelectorAll(selector)
      selectedHrefs.forEach(el => el.parentElement.classList.add(selectedClassName))
    }


    const arr = urlObj.hash.split('/') // при выбре "#!products/1" должны помечаться и "#!products"
    if (arr.length > 1 && arr[1]) { // если в urlObj.hash присутствуют параметры помечаем все href начинающиеся с части hash до /
      const cmn = arr[0]
      if (cmn) {
        const selector = `a[href='#${cmn}']`
        const selectedHrefs = document.querySelectorAll(selector)
        selectedHrefs.forEach(el => el.parentElement.classList.add(selectedClassName))
      }
    }
  }

  return {
    requestCache,
    // _preloadIncluds,
    doPreload,

    doIncludAll,
    doInsertInto,

    markSelectedLink,
  };
})();
