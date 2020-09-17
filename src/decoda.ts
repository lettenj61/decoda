type Csv = {
  header?: boolean
  json?: boolean
  delimiter?: string
  toKey?(raw: string): string
}

type Properties = {
  json?: boolean
}

export interface Decoda {
  csv(content: string, options?: Csv): any
  config(content: string, options?: Properties): any
}

const lineSeparator = /\r?\n/g

function decodeCsv(content: string, options: Csv): any {
  const { header, delimiter, toKey, json } = Object.assign(
    {
      header: false,
      json: false,
      delimiter: ',',
      toKey(raw: string) {
        return raw
      },
    },
    options
  )

  const rows = content.split(lineSeparator).map(u => u.split(delimiter))

  let fields: string[], startRow: number
  if (Array.isArray(header)) {
    fields = header
    startRow = 0
  } else if (header === true) {
    fields = rows[0]
    startRow = 1
  } else {
    const len = rows[0].length
    fields = new Array(len)
    for (let i = 0; i < len; i++) {
      fields[i] = `x${i + 1}`
    }
    startRow = 0
  }

  const len = rows.length
  const data: any[] = new Array(len - startRow)
  for (let i = 0; i + startRow < len; i++) {
    const cols = rows[i + startRow]
    data[i] = cols.reduce((bag, field, j) => {
      const key = typeof toKey === 'function' ? toKey(fields[j]) : fields[j]
      const val = json ? JSON.parse(field) : field
      bag[key] = val
      return bag
    }, {})
  }

  return data
}

function decodeEntry(
  property: string,
  raw: string,
  bag: any,
  { json = false }: Properties
): typeof bag {
  const paths = property.split(/\./g)
  const val = json ? JSON.parse(raw) : raw
  let depth = 0,
    tmp: any = bag,
    stop = paths.length - 1
  while (depth < paths.length) {
    const key = paths[depth]
    if (!(key in tmp)) {
      tmp[key] = depth === stop ? val : {}
    }
    tmp = tmp[key]
    depth++
  }
  return bag
}

function parseProperties(content: string, options: Properties): any {
  const rows = content.split(lineSeparator)
  const data = {}
  for (const expr of rows) {
    if (expr.trim() === '') continue
    if (expr[0] === '#') continue

    const [property, val] = expr.split(/[:=]/)
    decodeEntry(property.trim(), val.trim(), data, options)
  }
  return data
}

const decoda: Decoda = {
  csv(content: string, options: Csv = {}) {
    return decodeCsv(content, options)
  },

  config(content: string, options: Properties = {}) {
    return parseProperties(content, options)
  },
}

export default decoda
