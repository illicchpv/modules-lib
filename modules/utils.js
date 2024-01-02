function stringToDomElement(str){
  let doc = new DOMParser().parseFromString(str, "text/xml");
  return doc.firstChild 
}

function getRndIntInclusive(n, m, lg){
  const min = Math.min(n,m)
  const max = Math.max(n,m)
  let r = Math.round(Math.random()*(max - min) + min)
  if(lg)
    console.log('r: ', r, min, max);
  return r
}
