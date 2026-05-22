import chalk from 'chalk';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ServeOptions {
  port?: string;
}

function validatePort(port: string): number {
  const portNum = parseInt(port, 10);
  if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
    throw new Error(`Invalid port number: ${port}. Must be between 1 and 65535.`);
  }
  return portNum;
}

export async function serveCommand(options: ServeOptions) {
  const port = options.port || '3000';
  const webDir = path.resolve(__dirname, '../../web');

  // Validate port to prevent command injection
  let portNum: number;
  try {
    portNum = validatePort(port);
  } catch (error) {
    console.error(chalk.red(`Error: ${(error as Error).message}`));
    process.exit(1);
  }

  // Check if web directory exists
  if (!fs.existsSync(webDir)) {
    console.error(chalk.red('Web UI not found. Please ensure the web directory exists.'));
    process.exit(1);
  }

  // Check if node_modules exists in web directory
  const nodeModulesPath = path.join(webDir, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    console.log(chalk.cyan('Installing web dependencies...'));
    console.log(chalk.gray('This may take a moment...\n'));

    const installProcess = spawn('npm', ['install'], {
      cwd: webDir,
      stdio: 'inherit',
      shell: false,
    });

    installProcess.on('close', code => {
      if (code !== 0) {
        console.error(chalk.red(`npm install failed with code ${code}`));
        process.exit(1);
      }
      startServer(portNum, webDir);
    });
  } else {
    startServer(portNum, webDir);
  }
}

function startServer(port: number, webDir: string) {
  console.log(chalk.green('\n🚀 Starting CodeScaffold Web UI...\n'));
  console.log(chalk.gray(`   Local:   http://localhost:${port}`));
  console.log(chalk.gray(`   Network: http://0.0.0.0:${port}\n`));
  console.log(chalk.cyan('Press Ctrl+C to stop the server\n'));

  // Use spawn with separate arguments instead of shell to prevent command injection
  const server = spawn('npm', ['run', 'dev', '--', '--port', port.toString()], {
    cwd: webDir,
    stdio: 'pipe',
    shell: false,
  });

  server.stdout?.on('data', data => {
    process.stdout.write(data);
  });

  server.stderr?.on('data', data => {
    process.stderr.write(data);
  });

  server.on('close', code => {
    if (code !== 0) {
      console.error(chalk.red(`Server exited with code ${code}`));
    }
  });

  // Handle Ctrl+C gracefully
  process.on('SIGINT', () => {
    server.kill('SIGTERM');
    process.exit(0);
  });
}
