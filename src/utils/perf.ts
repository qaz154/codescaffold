import chalk from 'chalk';

const timings: Map<string, number> = new Map();

export function startTimer(label: string): void {
  timings.set(label, Date.now());
}

export function endTimer(label: string): number {
  const start = timings.get(label);
  if (!start) return 0;

  const duration = Date.now() - start;
  timings.delete(label);
  return duration;
}

export function printPerformanceReport(): void {
  console.log(chalk.cyan('\n⚡ 性能报告:\n'));

  const report = [
    { name: '组件选择', target: '< 100ms' },
    { name: '项目生成', target: '< 500ms' },
    { name: '总耗时', target: '< 3s' },
  ];

  for (const item of report) {
    const time = timings.get(item.name);
    if (time) {
      const status = time < 1000 ? chalk.green('✓') : chalk.yellow('⚠');
      console.log(`  ${status} ${item.name}: ${chalk.cyan(`${time}ms`)} (目标: ${item.target})`);
    }
  }
}

export function getPerformanceStats(): Record<string, number> {
  const stats: Record<string, number> = {};
  timings.forEach((value, key) => {
    stats[key] = value;
  });
  return stats;
}
