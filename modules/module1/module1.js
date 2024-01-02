var module1 = (() => {
  const moduleName = 'module1'

  // эта часть отвечает за создание и работу порождаемых экземпляров объектов 
  const istances = {}
  const createInstance = (instanceName) => {
    if (istances[instanceName]) throw new Error(`module1.instance '${instanceName}' already exist!`)

    const ins = {
      iname: instanceName,
      color: 'red',
      ival: 3,
      dataList: [],
      constructor(){
        this.dataList = []
        for(var i = 0; i < this.ival; i++){
          this.dataList.push({id: i, val: 0,})
        }
        this.getData()
        const $boxBar = document.querySelector(`.module1.${this.iname} .box_bar`)
        $boxBar.innerHTML = (`<div class="bar"><div class="bar__val" style="background-color:${this.color}"></div></div>`).repeat(this.ival)
      },
      getData(){
        // console.log('getData: ');
        for(var i = 0; i < this.ival; i++){
          let val = getRndIntInclusive(dval_MIN,dval_MAX)
          this.dataList[i].val = val
        }
        return this
      },
      render(){
        const $module = document.querySelector(`.module1.${this.iname}`)
        $module.querySelector('.instance').innerHTML = this.iname
        $module.querySelector('.val').innerHTML = this.ival; 
        
        let barList = $module.querySelectorAll('.bar')
        if(barList.length !== this.ival)
        {
          const $boxBar = $module.querySelector(`.box_bar`)
          $boxBar.innerHTML = (`<div class="bar"><div class="bar__val" style="background-color:${this.color}"></div></div>`).repeat(this.ival)
          barList = $module.querySelectorAll('.bar')
        }
        barList.forEach((el, i) => {
          const n = this.dataList[i].val
          el.querySelector('.bar__val').innerHTML = n
          el.querySelector('.bar__val').style.height = (n*2) + 'px'
        })
        return this
      },

      inc(){
        if(this.ival < ival_MAX){
          this.ival++;
          this.constructor();
          this.render()
          module2.getInstance('processor').clear()
          return this
        }
      },
      dec(){
        if(this.ival > ival_MIN){
          this.ival--;
          this.constructor();
          this.render()
          module2.getInstance('processor').clear()
          return this
        }
      },

      getCriticalCount(criticalValue){
        const rez = this.dataList.reduce((acc, el) => {
          if(el.val > criticalValue){
            acc.s += el.val
            acc.n++
          }
          return acc
        }, {s: 0, n: 0})
        // console.log(criticalValue, this.dataList, 'rez: ', rez);
        return rez
      },
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
      value.render() // render all module1 instances
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
