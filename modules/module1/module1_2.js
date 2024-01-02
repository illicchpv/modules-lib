{
  const moduleName = 'module1_2'

  // определяем дополнительные функции
  module1.func2 = () => {
    console.log('module1.func2 OK', moduleName)
  }
  module1.func3 = () => {
    console.log('module1.func3 OK', moduleName)
  }

  { // этот кусок надо вставить перед выходом
    const __el = __modulesList.find(el => el.name === moduleName)
    if(__el) setTimeout(function(__el){__modulesLoader.continueLoad(__el)}, 1, __el)
  }
}
