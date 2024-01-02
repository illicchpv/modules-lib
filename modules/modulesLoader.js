var __modulesLoader = (() => {
  let __loadreadyCalBack = undefined

  function doload(__modulesList, loadreadyCalBack) {
    __loadreadyCalBack = loadreadyCalBack
    if(!__modulesList || __modulesList.length == 0){
      if(__loadreadyCalBack) __loadreadyCalBack()
      return
    }
    {
      __modulesList.forEach(el => {
        // console.log('css module: ', el);
        if (!el.css) return
        const jsList = el.css.split(';').forEach(css => {
          css = css.trim()
          if (css === '') return
          // console.log('css: ', css);
          const style = document.createElement('link')
          style.href = css
          style.setAttribute('rel', 'stylesheet')
          document.head.append(style)
        })
      })
    }
    {
      for (const el of __modulesList) {
        el.ok = false
      }
      for (const el of __modulesList) {
        // console.log('el: ', el);
        if (!el.js) continue
        let js = el.js.trim()
        if (js === '') continue
        // console.log('js: ', js);
        const script = document.createElement('script')
        script.src = js
        script.setAttribute('defer', '')
        document.head.append(script)
        break
      }
    }
  }
  function continueLoad(readyEl) {
    // console.log('-------------readyEl: ', readyEl);
    readyEl.ok = true
    for (const el of __modulesList) {
      // console.log('el: ', el);
      if (el.ok) continue
      if (!el.js) continue
      let js = el.js.trim()
      if (js === '') continue
      // console.log('js: ', js);
      const script = document.createElement('script')
      script.src = js
      script.setAttribute('defer', '')
      document.head.append(script)
      return
    }
    if(__loadreadyCalBack) __loadreadyCalBack()
    return true
  }

  return {
    continueLoad,
    doload,
  }
})()
