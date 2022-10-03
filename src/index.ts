import * as mdiIcons from '@mdi/js'
import { Plugin } from "vite";
import { FilterPattern, createFilter } from "@rollup/pluginutils";
import MagicString from 'magic-string';

interface Options {
  icons: {
    [name: string]: string
  },
  include: FilterPattern,
  exclude: FilterPattern
}

const converter = (str: string) => str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)

export function mdi({icons = {}, include = ['./**/*.vue', './**/*.js', './**/*.ts'], exclude = []}: Partial<Options> = {}): Plugin {
  const unsortedIcons = {
    ...mdiIcons,
    ...icons
  }

  const sortedIcons = Object.fromEntries(Object.entries(unsortedIcons).sort((a,b) => 
    a[0].length > b[0].length ? -1 : 1
  ).flatMap(([key, val]) => {
    return [
      [key, val],
      [converter(key), val]
    ]
  }))

  const filter = createFilter(include, exclude)

  return {
    name: 'mdi-icons',
    transform(code, id) {
      if(filter(id) && !code.includes('//@mdi-off') && !code.includes('// @mdi-off')) {
        const ms = new MagicString(code)
        
        Object.entries(sortedIcons).forEach(([key, mdi]) => {
          ms.replaceAll(key, mdi)
        })
        
        return {
          code: ms.toString(),
          map: ms.generateMap()
        }
      }
    }
  }
}
