var mtimer = (() => {
  const moduleName = 'mtimer'
  const frequency_MIN = 1
  const frequency_MAX = 10

  // эта часть отвечает за создание и работу порождаемых экземпляров объектов 
  const istances = {}
  const createInstance = (instanceName, cb) => {
    if (istances[instanceName]) throw new Error(`mtimer.instance '${instanceName}' already exist!`)

    const ins = {
      iname: instanceName,
      intervalId: undefined,
      timerCallback: undefined,
      pause: 1,
      counter: 777,
      frequency: 3, // сек
      // ----------------------------------------------
      constructor() {
        this.timerCallback = cb
        this.iEl = document.querySelector(`.${moduleName}.${this.iname}`)
        this.restartTimer()
      },
      render() {
        this.iEl.querySelector('.instance').innerHTML = this.iname
        this.iEl.querySelector('.counter').innerHTML = this.counter
        // this.iEl.querySelectorAll('.btnText').forEach(el => el.classList.remove('active')); 
        // this.iEl.querySelector(`.btnText_${this.pause}`).classList.add('active')

        if(this.pause){
          this.iEl.querySelector('.switch-input').removeAttribute('checked')        
        }else{
          this.iEl.querySelector('.switch-input').setAttribute('checked', '')        
        }

        this.iEl.querySelector('.frequency').innerHTML = this.frequency
        if(this.frequency <= frequency_MIN){
          this.iEl.querySelector('.frequencyDec').setAttribute('disabled', true)
        }else{
          this.iEl.querySelector('.frequencyDec').removeAttribute('disabled')
        }
        if(this.frequency >= frequency_MAX){
          this.iEl.querySelector('.frequencyInc').setAttribute('disabled', true)
        }else{
          this.iEl.querySelector('.frequencyInc').removeAttribute('disabled')
        }

        return this
      },
      incCouunter() {
        this.counter++
        this.render()
        return this
      },
      toggleTimer(){
        this.pause = (this.pause) ? 0 : 1
        this.render()
      },
      frequencyInc(deltaSec){
        const f = this.frequency
        this.frequency += deltaSec
        if(this.frequency < frequency_MIN) this.frequency = frequency_MIN
        if(this.frequency > frequency_MAX) this.frequency = frequency_MAX
        if(f === this.frequency) return
        this.restartTimer()
        this.render()
      },
      restartTimer(){
        if(this.intervalId) clearInterval(this.intervalId)
        const _this = this
        const cbFunc = () => {
          if(_this.pause) return
          _this.counter++
          _this.render()
          if(this.timerCallback) this.timerCallback(_this)
        }
        cbFunc()
        this.intervalId = setInterval(() => {
          cbFunc()
        }, this.frequency*1000);        
      }

      // ----------------------------------------------
    }
    istances[instanceName] = ins

    setTimeout(function (ins) { ins.constructor() }, 0, ins)
    return ins
  }
  const getInstance = (instanceName) => {
    return istances[instanceName]
  }
  const getModuleInstance = (el) => {
    const inst = istances[el.closest('.' + moduleName).dataset.instance]
    // console.log('inst: ', inst);

    return inst
  }
  const renderAllInstance = () => {
    for (const [key, value] of Object.entries(istances)) {
      value.render() // render all module2 instances
    }
  }
  const scanAllInstance = (cbFunc) => {
    for (const [key, value] of Object.entries(istances)) {
      cbFunc(value)
    }
  }

  { //ВНИМАНИЕ! этот ОБЯЗАТЕЛЬНЫЙ кусок надо вставить перед return
    const __el = __modulesList.find(el => el.name === moduleName)
    if (__el) setTimeout(function (__el) { __modulesLoader.continueLoad(__el) }, 1, __el)
    const r = { // тут перечисляются функции и свойства модуля которые будут доступные из вне.
      moduleName,

      createInstance,
      getInstance,
      renderAllInstance,
      getModuleInstance,
      scanAllInstance,
    }
    const m = __modulesList.find(el => el.name === moduleName)
    if(m) {m.module = r} else { throw new Error(`Ошибка в модуле: ${moduleName}`)}
    return r
  }
})()
