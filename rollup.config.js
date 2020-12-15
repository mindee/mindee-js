import typescript from 'rollup-plugin-typescript2'
import pkg from './package.json'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import copy from 'rollup-plugin-copy'
import url from '@rollup/plugin-url'
const config = [
  {
    input: 'src/index.ts',
    output: [
      {
        file: pkg.main,
        format: 'es',
        sourcemap: true,
      },
    ],
    external: [...Object.keys(pkg.dependencies || {})],
    plugins: [
      copy({
        targets: [{ src: 'src/common/index.d.ts', dest: 'build' }],
      }),
      url(),
      resolve(),
      typescript({ typescript: require('typescript') }),
      commonjs({
        include: 'node_modules/**',
      }),
    ],
  },
]

export default config
