// jshint esversion: 11
(async () => {
  
  const $ = query => document.querySelector(query);
  const $$ = query => document.querySelectorAll(query);
  EventTarget.prototype.on = function (...args) { return this.addEventListener(...args) };
  EventTarget.prototype.trigger = function (name, options={}) { return this.dispatchEvent(Object.assign(new Event(name), options)) };

  const min = (a, b) => a < b ? a : b;
  const max = (a, b) => a > b ? a : b;
  const choose = arr => arr[0|(Math.random()*arr.length)];
  
  let c = $('canvas');
  let ctx = c.getContext('2d');

  let [width, height] = [c.width, c.height] = [256, 256];
  
  let grid = [...Array(width)].map((_, x) => [...Array(height)].map((_, y) => {
    // return 0;
    return 0|(Math.random()*3);
  } ));
  let zone_types = {
    undefined: () => true,
    ' ': () => false,
    '+': (x, y) => x == 0 || y == 0,
    'x': (x, y) => x-y == 0 || x+y == 0,
    'o': (x,y,r)=> Math.abs(x) == r || Math.abs(y) == r,
    'r': (x, y) => Math.random() < 0.5,
    'd': (x,y,r)=> Math.abs(x) + Math.abs(y) <= r,
  };
  // col: abgr
  let cells = [
    {
      id: 'a',
      col: 0xffcc7f33, // 'hsl(210, 60%, 50%)',
      // zone_type: 'd',
      radius: 5,
      convert: ({ a, b, c }) => ({ b: a })
    },
    {
      id: 'b',
      col: 0xffcc6633, // 'hsl(220, 60%, 50%)',
      // zone_type: 'd',
      radius: 5,
      convert: ({ a, b, c }) => ({ c: b })
    },
    {
      id: 'c',
      col: 0xffcc4d33, // 'hsl(230, 60%, 50%)',
      // zone_type: 'd',
      radius: 5,
      convert: ({ a, b, c }) => ({ a: c })
    }
  ];
  
  const map = [...Array(cells.length)].map((e, i) => i).reduce((a, i) => {
    a[cells[i].id] = i;
    return a;
  }, {});
  
  function update(x, y) {
    let me = grid[x][y];
    let mapper = { ...map, ...cells[me].convert(map)};
    const r = cells[me].radius;
    const left = max(0, x-r),
          top = max(0, y-r);
    let idata = ctx.getImageData(left, top, 1+2*r, 1+2*r);
    let pixels = new Uint32Array(idata.data.buffer);
    
    for (let X = left; X <= min(x+r, width-1 ); X++)
    for (let Y = top; Y <= min(y+r, height-1); Y++) {
      let cell_i = grid[X][Y];
      let cell = cells[cell_i];
      if (!zone_types[cells[me].zone_type](X-x, Y-y, r)) continue;
      let mapped = mapper[cell.id];
      if (Array.isArray(mapped)) mapped = choose(mapped);
      cell_i = grid[X][Y] = mapped;
      
      const i = (X-left) + (Y-top)*(1+2*r);
      pixels[i] = cells[cell_i].col;
    }
    ctx.putImageData(idata, left, top)
  }
  
  do {
    let last = performance.now();
    let count = 0;
    while (performance.now() - last < 1000/30 && count++ < 2*width) {
      update(0|(Math.random()*width), 0|(Math.random()*height));
    }
    await new Promise(requestAnimationFrame);
  } while (true);

})();







