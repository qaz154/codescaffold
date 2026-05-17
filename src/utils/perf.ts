import chalk from 'chalk';

const timers: Map<string, number> = new Map();
const durations: Map<string, number> = new Map();

export function startTimer(label: string): void {
  timers.set(label, Date.now());
}

export function endTimer(label: string): number {
  const start = timers.get(label);
  if (!start) return 0;

  const duration = Date.now() - start;
  durations.set(label, duration);
  timers.delete(label);
  return duration;
}

export function printPerformanceReport(): void {
  console.log(chalk.cyan('\n⚡ 性能报告:\n'));

  const report = [
    { name: '组件选择', target: 100 },
    { name: '项目生成', target: 500 },
    { name: '总耗时', target: 3000 },
  ];

  for (const item of report) {
    const duration = durations.get(item.name);
    if (duration !== undefined) {
      const status = duration < item.target ? chalk.green('✓') : chalk.yellow('⚠');
      console.log(
        `  ${status} ${item.name}: ${chalk.cyan(`${duration}ms`)} (目标: < ${item.target}ms)`
      );
    }
  }
}

export function getPerformanceStats(): Record<string, number> {
  const stats: Record<string, number> = {};
  durations.forEach((value, key) => {
    stats[key] = value;
  });
  return stats;
}
