var module2 = (() => {
  const moduleName = 'module2'

  // эта часть отвечает за создание и работу порождаемых экземпляров объектов 
  const istances = {}
  const createInstance = (instanceName) => {
    if (istances[instanceName]) throw new Error(`module1.instance '${instanceName}' already exist!`)

    const ins = {
      iname: instanceName,
      interval: 3*1000,
      intervalCallCount: 0,
      iEl: undefined,
      dvalCriticalEl: undefined,
      timerCount: undefined,
      fetchNomEl: undefined,
      chartEl: undefined,
      criticalLineEl: undefined,
      timerPause: false,

      dvalCritical: 30,
      dataList: [],
      lookInstances: "",
      // ----------------------------------------------
      constructor(){
        // console.log('module2 instance constructor ');
        this.iEl = document.querySelector(`.${moduleName}.${this.iname}`)
        // console.log('this.iEl: ', this.iEl);
        this.dvalCriticalEl = this.iEl.querySelector('.critical__level-value')
        this.timerCount = this.iEl.querySelector('.timer__count')
        this.fetchNomEl = this.iEl.querySelector('.timer__fetch-nom')
        this.chartEl = this.iEl.querySelector('.chart-axis')
        // console.log('criticalLineEl: ', this.criticalLineEl);
        this.criticalLineEl = this.iEl.querySelector('.critical__line')
        // console.log('criticalLineEl: ', this.criticalLineEl);

        this.clear()
        this.getData()
      },
      getData(){
        // console.log(`module2.${instanceName} getData`, this.lookInstances);
        let summ = {s: 0, n: 0}
        this.lookInstances.split(';').forEach(el => {
          if(!el) return
          const iel = document.querySelector(`.${el}`)
          // console.log('iel: ', iel);
          const inst = module1.getModuleInstance(iel)
          // console.log('inst: ', inst.dataList);
          const cnt = inst.getCriticalCount(this.dvalCritical)
          // console.log('cnt: ', cnt);
          summ.s += cnt.s
          summ.n += cnt.n
        })
        // console.log('summ: ', summ);
        summ = Math.round(summ.s/summ.n) 
        this.dataList.push(summ)
      },
      clear(){
        // return
        this.dataList = []
        this.chartEl.querySelectorAll('.chart-bar').forEach(el => el.remove())
      },
      render(){
        // console.log(`module2.${instanceName} render`);
        // this.clear()
        this.iEl.querySelector('.instance').innerHTML = instanceName

        // timer__on timer__off
        this.timerCount.querySelector('.timer__on').classList.remove('timer__on-off-selected')
        this.timerCount.querySelector('.timer__off').classList.remove('timer__on-off-selected')
        this.timerPause 
          ? this.timerCount.querySelector('.timer__off').classList.add('timer__on-off-selected') 
          : this.timerCount.querySelector('.timer__on').classList.add('timer__on-off-selected');

        this.dvalCriticalEl.innerHTML = this.dvalCritical
        this.criticalLineEl = this.iEl.querySelector('.critical__line')
          // this.iEl.querySelector('.critical__line').style.bottom = this.dvalCritical+'%'
        this.criticalLineEl.style.bottom = this.dvalCritical+'%'
        // console.log('this.criticalLineEl: ', this.criticalLineEl);
        
        const lastBarIndex = this.chartEl.querySelectorAll('.chart-bar').length
        // console.log('lastBarIndex: ', lastBarIndex, this.dataList.length);
        for(let i = lastBarIndex; i < this.dataList.length; i++){
          const el = this.dataList[i]
          // console.log('el: ', el);
          const doc = stringToDomElement(`<div class="chart-bar" style="height: ${el}%;"></div>`)
          this.chartEl.append(doc)
        }
        this.chartEl.innerHTML += ''
      },
      startLook(){
        // console.log('startLook', this.lookInstances);
        const dothis = () => {
          if(this.timerPause) return
          ++this.intervalCallCount
          // console.log('startLook: ', this.intervalCallCount);
          this.fetchNomEl.innerHTML = this.intervalCallCount;
          this.getData()
          this.render()
        }

        dothis()
        let intervalId = setInterval(dothis, this.interval);        
      },
      pauseToggle(){
        this.timerPause = !this.timerPause;
        this.render()
        return this
      },
      decCritical(){
        if(this.dvalCritical > dval_MIN ){
          this.dvalCritical--
          this.clear()
          this.render()
          return this
        }
      },
      incCritical(){
        if(this.dvalCritical < dval_MAX ){
          this.dvalCritical++
          this.clear()
          this.render()
          return this
        }
      },
      // ----------------------------------------------
    }
    istances[instanceName] = ins
    // ins.constructor()

    setTimeout(function(ins){ins.constructor()}, 0, ins) 
    return ins
  }
  const getInstance = (instanceName) => {
    return istances[instanceName]
  }
  const getModuleInstance = (el) => {
    const inst = istances[el.closest('.' + moduleName).dataset.instance]
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
    if (__el) setTimeout(function (__el) {  __modulesLoader.continueLoad(__el)  }, 1, __el)
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
