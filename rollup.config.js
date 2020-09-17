/**
 * @typedef { import('rollup').RollupOptions } RollupOptions
 * @typedef { import('rollup').OutputOptions } OutputOptions
 **/

import closureCompiler from '@ampproject/rollup-plugin-closure-compiler'
import typescript from '@rollup/plugin-typescript'

/**
 * @param {OutputOptions} output
 * @param {string} languageOut
 * @returns {[OutputOptions, OutputOptions]}
 */
function makeBundle(output, languageOut) {
  return [
    {
      ...output,
      file: output.file + '.js',
      plugins: [closureCompiler({
        'language_out': languageOut,
        formatting: 'PRETTY_PRINT'
      })]
    },
    {
      ...output,
      file: output.file + '.min.js',
      plugins: [closureCompiler({
        'language_out': languageOut,
        'compilation_level': 'ADVANCED'
      })]
    }
  ]
}

/** @type RollupOptions */
export default {
  input: 'src/decoda.ts',
  output: [
    // UMD
    ...makeBundle({
      file: 'dist/decoda.umd',
      format: 'umd',
      name: 'decoda',
    }, 'ECMASCRIPT5'),
    // ESM
    ...makeBundle({
      file: 'dist/decoda.esm',
      format: 'es'
    }, 'ECMASCRIPT_2019')
  ],
  plugins: [typescript()]
}