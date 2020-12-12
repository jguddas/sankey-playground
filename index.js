import React from 'react'
import { render } from 'react-dom'
import lzString from 'lz-string'
import uniq from 'lodash/uniq'
import debounce from 'lodash/debounce'
import { Page, Form, colors } from 'tabler-react'
import { Chip } from '@nivo/tooltip'
import { ResponsiveSankey } from '@nivo/sankey'
import 'tabler-react/dist/Tabler.css'

const setSearch = debounce((value) => {
  const newurl = `${
    window.location.protocol
  }//${
    window.location.host
  }${
    window.location.pathname
  }?${
    lzString.compressToEncodedURIComponent(value)
  }`;
  window.history.pushState({ path: newurl }, '', newurl);
}, 400)

const defaultValue = `
Wages [2000] Budget
Interest [25] Budget
Budget [500] Taxes
Budget [450] Housing
Budget [310] Food
Budget [205] Transportation
Budget [400] Health Care
Budget [160] Other Necessities
`.trim()

const getInpFromSearch = () => (
  lzString.decompressFromEncodedURIComponent(window.location.search.slice(1))
)

const findCircularLink = (links, origin, targets) => links.flatMap(link => {
  if (link.source === origin) {
    if (targets.includes(link.target)) {
      return link
    }
    return findCircularLink(links, link.target, [...targets, link.source])
  }
  return []
})

const App = () => {
  const [inp, setInp] = React.useState(
    getInpFromSearch()
    || defaultValue,
  )

  React.useEffect(() => {
    const listener = () => {
      const newInp = getInpFromSearch()
      if (newInp !== inp) setInp(newInp)
    }
    window.addEventListener('popstate', listener)
    return () => window.removeEventListener('popstate', listener)
  }, [inp, setInp])

  const linksWithCircular = inp
    .split('\n')
    .map(val => val.match(/^(.+) \[([\d.]+)\] (.+)$/))
    .filter(Boolean)
    .filter(val => val[1] !== val[3] && val[2] !== '0')
    .map(([, source, value, target]) => ({
      source,
      value: parseFloat(value),
      target,
    }))
  const links = linksWithCircular.reduce((acc, link) => {
    const circular = findCircularLink(acc, link.source, [])
    return acc.map(val => (
      circular.findIndex(({ id }) => id === val.id) === 0
        ? { ...val, target: `${val.target}(circular)` }
        : val
    ))
  }, linksWithCircular.map((link, idx) => ({ ...link, id: idx })))

  return (
    <Page.Content>
      <h1>Sankey Playground</h1>
      <Form.Textarea
        className="mb-4"
        value={inp}
        rows={Math.min(10, inp.split('\n').length)}
        onChange={(e) => {
          setSearch(e.target.value.trim())
          setInp(e.target.value)
        }}
      />
      {links.length ? (
        <div style={{ height: Math.max(500, window.innerHeight * 0.8) }}>
          <ResponsiveSankey
            data={{
              nodes: uniq([
                ...links.map(link => link.source),
                ...links.map(link => link.target),
              ]).map(id => ({ id })),
              links,
            }}
            colors={[
              colors.azure,
              colors.red,
              colors.yellow,
              colors.cyan,
              colors.lime,
              colors.teal,
              colors.pink,
              colors.green,
              colors.blue,
              colors.orange,
              colors.indigo,
              colors.purple,
            ]}
            animate={false}
            enableLinkGradient
            margin={{ top: 10, bottom: 10 }}
            nodeTooltip={node => {
              const targetValue = node.targetLinks.reduce((acc, targetLink) => (
                acc + targetLink.value
              ), 0)
              const sourceValue = node.sourceLinks.reduce((acc, sourceLink) => (
                acc + sourceLink.value
              ), 0)
              return (
                <div style={{ whiteSpace: 'pre', display: 'flex', alignItems: 'center' }}>
                  <strong>
                    {node.label}
                  </strong>
                  <Chip color={node.color} style={{ marginLeft: 7, marginRight: 7 }} />
                  <strong>
                    {targetValue > sourceValue ? targetValue : sourceValue}
                  </strong>
                </div>
              )
            }}
          />
        </div>
      ) : null}
    </Page.Content>
  )
}

render(<App />, document.getElementById('root'))
