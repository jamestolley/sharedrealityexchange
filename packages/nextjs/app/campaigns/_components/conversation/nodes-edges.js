export const initialNodes = [
    {
      id: '1',
      type: 'input',
      data: { label: 'input' },
      position: { x: 0, y: 0 },
    },
    {
      id: '2',
      data: { label: 'node 2node 2node 2node 2node 2node 2' },
      position: { x: 0, y: 100 },
    },
    {
      id: '2a',
      data: { label: 'node 2a' },
      position: { x: 0, y: 200 },
    },
    {
      id: '2b',
      data: { label: 'node 2b' },
      position: { x: 0, y: 300 },
    },
    {
      id: '2c',
      data: { label: 'node 2c' },
      position: { x: 0, y: 400 },
    },
    {
      id: '2d',
      data: { label: 'node 2d' },
      position: { x: 0, y: 500 },
    },
    {
      id: '3',
      data: { label: 'node 3' },
      position: { x: 200, y: 100 },
    },
  ];
  
  export const initialEdges = [
    { id: 'e12', source: '1', target: '2', type: 'smoothstep' },
    { id: 'e13', source: '1', target: '3', type: 'smoothstep' },
    { id: 'e22a', source: '2', target: '2a', type: 'smoothstep' },
    { id: 'e22b', source: '2', target: '2b', type: 'smoothstep' },
    { id: 'e22c', source: '2', target: '2c', type: 'smoothstep' },
    { id: 'e2c2d', source: '2c', target: '2d', type: 'smoothstep' },
  ];