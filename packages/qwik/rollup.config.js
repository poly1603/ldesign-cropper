import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

export default [
  // ESM build
  {
    input: 'src/index.ts',
    output: {
      dir: 'es',
      format: 'esm',
      preserveModules: true,
      preserveModulesRoot: 'src',
      sourcemap: true,
    },
    external: [
      '@builder.io/qwik',
      '@builder.io/qwik/jsx-runtime',
      '@ldesign/cropper-core',
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: 'es',
        rootDir: 'src',
        compilerOptions: {
          outDir: undefined,
        },
      }),
    ],
  },
  // CJS build
  {
    input: 'src/index.ts',
    output: {
      dir: 'lib',
      format: 'cjs',
      preserveModules: true,
      preserveModulesRoot: 'src',
      sourcemap: true,
      exports: 'named',
    },
    external: [
      '@builder.io/qwik',
      '@builder.io/qwik/jsx-runtime',
      '@ldesign/cropper-core',
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        rootDir: 'src',
        compilerOptions: {
          outDir: undefined,
        },
      }),
    ],
  },
]
