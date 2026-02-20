import axios from 'axios'

const cache = new Map()

/**
 * Sends a WPS DescribeProcess request and returns a structured description
 * of the process inputs, outputs, and metadata.
 *
 * Results are cached per baseUrl+identifier so repeated calls are free.
 *
 * @param {string} baseUrl - WPS server URL
 * @param {string} identifier - Process identifier
 * @returns {Promise<ProcessDescription>}
 *
 * @typedef {Object} ProcessDescription
 * @property {string} identifier
 * @property {string} title
 * @property {string} [abstract]
 * @property {ProcessInput[]} inputs
 * @property {ProcessOutput[]} outputs
 *
 * @typedef {Object} ProcessInput
 * @property {string} id
 * @property {string} title
 * @property {'LiteralData'|'ComplexData'|'BoundingBoxData'} type
 * @property {boolean} required
 * @property {string} [dataType]       - For LiteralData (e.g. 'string', 'float')
 * @property {string} [defaultValue]   - For LiteralData
 * @property {string[]} [allowedValues] - For LiteralData with constrained values
 * @property {string} [mimeType]       - For ComplexData (default format)
 * @property {string[]} [supportedMimeTypes] - For ComplexData (all formats)
 *
 * @typedef {Object} ProcessOutput
 * @property {string} id
 * @property {string} title
 * @property {'LiteralData'|'ComplexData'} type
 * @property {string} [mimeType]
 */
export async function describeProcess (baseUrl, identifier) {
  const cacheKey = `${ baseUrl }::${ identifier }`
  if (cache.has(cacheKey)) return cache.get(cacheKey)

  const { data } = await axios.get(baseUrl, {
    params: {
      service: 'WPS',
      version: '1.0.0',
      request: 'DescribeProcess',
      identifier,
    },
    headers: { Accept: 'application/xml' },
    responseType: 'text',
  })

  const result = parseProcessDescription(data, identifier)
  cache.set(cacheKey, result)
  return result
}

export function clearDescribeCache () {
  cache.clear()
}

// --- XML parsing -----------------------------------------------------------

const OWS_NS = 'http://www.opengis.net/ows/1.1'
const WPS_NS = 'http://www.opengis.net/wps/1.0.0'

function parseProcessDescription (xml, identifier) {
  const doc = new DOMParser().parseFromString(xml, 'application/xml')

  const processNodes = doc.getElementsByTagNameNS(WPS_NS, 'ProcessDescription')
  const processNode = findProcessNode(processNodes, identifier) || processNodes[0]

  if (!processNode) {
    throw new Error(`DescribeProcess: no ProcessDescription found for "${ identifier }"`)
  }

  return {
    identifier,
    title: owsText(processNode, 'Title') || identifier,
    abstract: owsText(processNode, 'Abstract') || '',
    inputs: parseInputs(processNode),
    outputs: parseOutputs(processNode),
  }
}

function findProcessNode (nodes, identifier) {
  for (let i = 0; i < nodes.length; i++) {
    const id = owsText(nodes[i], 'Identifier')
    if (id === identifier) return nodes[i]
  }
  return null
}

function parseInputs (processNode) {
  const dataInputs = processNode.getElementsByTagNameNS(WPS_NS, 'Input')
  const inputs = []

  for (let i = 0; i < dataInputs.length; i++) {
    const node = dataInputs[i]
    const input = {
      id: owsText(node, 'Identifier'),
      title: owsText(node, 'Title') || owsText(node, 'Identifier'),
      required: parseInt(node.getAttribute('minOccurs') || '0', 10) > 0,
    }

    if (hasChild(node, 'LiteralData')) {
      input.type = 'LiteralData'
      Object.assign(input, parseLiteralData(node))
    } else if (hasChild(node, 'ComplexData')) {
      input.type = 'ComplexData'
      Object.assign(input, parseComplexData(node))
    } else if (hasChild(node, 'BoundingBoxData')) {
      input.type = 'BoundingBoxData'
    } else {
      input.type = 'LiteralData'
    }

    inputs.push(input)
  }

  return inputs
}

function parseOutputs (processNode) {
  const outputNodes = processNode.getElementsByTagNameNS(WPS_NS, 'Output')
  const outputs = []

  for (let i = 0; i < outputNodes.length; i++) {
    const node = outputNodes[i]
    const output = {
      id: owsText(node, 'Identifier'),
      title: owsText(node, 'Title') || owsText(node, 'Identifier'),
    }

    if (hasChild(node, 'ComplexOutput')) {
      output.type = 'ComplexData'
      const complexNode = firstChild(node, 'ComplexOutput')
      output.mimeType = parseDefaultMimeType(complexNode)
    } else {
      output.type = 'LiteralData'
    }

    outputs.push(output)
  }

  return outputs
}

function parseLiteralData (inputNode) {
  const result = {}
  const litNode = firstChild(inputNode, 'LiteralData')
  if (!litNode) return result

  const dataType = owsText(litNode, 'DataType')
  if (dataType) result.dataType = dataType

  const defaultVal = litNode.getElementsByTagNameNS(WPS_NS, 'DefaultValue')
  if (defaultVal.length > 0) {
    result.defaultValue = defaultVal[0].textContent.trim()
  }

  const allowedNode = litNode.getElementsByTagNameNS(OWS_NS, 'AllowedValues')
  if (allowedNode.length > 0) {
    const values = allowedNode[0].getElementsByTagNameNS(OWS_NS, 'Value')
    result.allowedValues = Array.from(values).map(v => v.textContent.trim())
  }

  return result
}

function parseComplexData (inputNode) {
  const result = {}
  const complexNode = firstChild(inputNode, 'ComplexData')
  if (!complexNode) return result

  result.mimeType = parseDefaultMimeType(complexNode)
  result.supportedMimeTypes = parseSupportedMimeTypes(complexNode)

  return result
}

function parseDefaultMimeType (parent) {
  const defNode = parent?.getElementsByTagName('Default')[0]
  const formatNode = defNode?.getElementsByTagName('Format')[0]
  const mimeNode = formatNode?.getElementsByTagName('MimeType')[0]
      ?? formatNode?.getElementsByTagNameNS(OWS_NS, 'MimeType')[0]
  return mimeNode?.textContent.trim() || null
}

function parseSupportedMimeTypes (parent) {
  const mimeTypes = []
  const supported = parent?.getElementsByTagName('Supported')[0]
  if (!supported) return mimeTypes

  const formats = supported.getElementsByTagName('Format')
  for (let i = 0; i < formats.length; i++) {
    const mimeNode = formats[i].getElementsByTagName('MimeType')[0]
        ?? formats[i].getElementsByTagNameNS(OWS_NS, 'MimeType')[0]
    if (mimeNode) mimeTypes.push(mimeNode.textContent.trim())
  }
  return mimeTypes
}

// --- DOM helpers ------------------------------------------------------------

function owsText (parent, localName) {
  const el = parent.getElementsByTagNameNS(OWS_NS, localName)[0]
  return el?.textContent.trim() || null
}

function hasChild (parent, localName) {
  return firstChild(parent, localName) !== null
}

function firstChild (parent, localName) {
  return parent.getElementsByTagNameNS(WPS_NS, localName)[0]
      ?? parent.getElementsByTagName(localName)[0]
      ?? null
}
