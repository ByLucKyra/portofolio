// Run after the Skills entrance animation, in ALL and a focused branch.
export async function verifySkillConnections(page) {
  const result = await page.evaluate(() => [...document.querySelectorAll('.skill-graph')].map(graph => {
    const nodes = [...graph.querySelectorAll('.skill-node-mark')];
    const paths = [...graph.querySelectorAll('.skill-connector')];
    const root = graph.querySelector('.skill-root').getBoundingClientRect();
    return paths.length === nodes.length && paths.every((path, index) => {
      const style = getComputedStyle(path);
      const matrix = path.getScreenCTM();
      const start = path.getPointAtLength(0).matrixTransform(matrix);
      const end = path.getPointAtLength(path.getTotalLength()).matrixTransform(matrix);
      const node = nodes[index].getBoundingClientRect();
      return style.strokeDasharray === 'none' && Number(style.opacity) === 1 &&
        Math.hypot(start.x - (root.left + root.width / 2), start.y - (root.top + root.height / 2)) < 2 &&
        Math.hypot(end.x - (node.left + node.width / 2), end.y - (node.top + node.height / 2)) < 2;
    });
  }));
  if (!result.length || result.some(connected => !connected)) throw new Error(`Disconnected skill branch: ${JSON.stringify(result)}`);
  return result;
}
