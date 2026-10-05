import { defineConfig } from 'vitest/config';

/**
 * 时区必须在配置里钉死，不要在测试代码里改 `process.env.TZ`：
 * Node 读取时区的时机不保证，改不生效是静默的，
 * 一条永不失败的断言比没有断言更糟。
 *
 * `resolve.tsconfigPaths` 提供 `@/*` → `src/*` 别名，与 tsconfig.json 同源。
 */
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    env: { TZ: 'Asia/Shanghai' },
    include: ['__tests__/**/*.test.ts'],
  },
});
