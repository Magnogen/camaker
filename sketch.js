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
  
  let grid = [...Array(height)].map((_, x) => [...Array(width)].map((_, y) => {
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
  let cells = [
    {
      id: 'a',
      col: 'hsl(210, 60%, 50%)',
      // zone_type: 'd',
      r: 5,
      convert: ({ a, b, c }) => ({ b: a })
    },
    {
      id: 'b',
      col: 'hsl(220, 60%, 50%)',
      // zone_type: 'd',
      r: 5,
      convert: ({ a, b, c }) => ({ c: b })
    },
    {
      id: 'c',
      col: 'hsl(230, 60%, 50%)',
      // zone_type: 'd',
      r: 5,
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
    const r = cells[me].r;
    for (let _X = max(0,x-r); _X <= min(x+r, width-1 ); _X++)
    for (let _Y = max(0,y-r); _Y <= min(y+r, height-1); _Y++) {
    // for (let _X = x-cells[me].r; _X <= x+cells[me].r; _X++)
    // for (let _Y = y-cells[me].r; _Y <= y+cells[me].r; _Y++) {
      let X = _X, Y = _Y;
      // if (X > width-1) X -= width;
      // if (X < 0) X += width;
      // if (Y > height-1) Y -= height;
      // if (Y < 0) Y += height;
      
      let cell_i = grid[X][Y];
      let cell = cells[cell_i];
      if (!zone_types[cells[me].zone_type](_X-x, _Y-y, r)) continue;
      let mapped = mapper[cell.id];
      if (Array.isArray(mapped)) mapped = choose(mapped);
      cell_i = grid[X][Y] = mapped;
      ctx.fillStyle = cells[cell_i].col;
      ctx.fillRect(X, Y, 1, 1);
    }
  }
  
  for (let x = 0; x < grid.length; x++) for (let y = 0; y < grid[x].length; y++) {
    ctx.fillStyle = cells[grid[x][y]].col;
    ctx.fillRect(x, y, 1, 1);
  }
  
  while (true) {
    let last = performance.now();
    while (performance.now() - last < 1000/30) {
      update(0|(Math.random()*width), 0|(Math.random()*width));
    }
    await new Promise(requestAnimationFrame);
  }

})();







