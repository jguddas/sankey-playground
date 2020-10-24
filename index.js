import React from 'react'
import { render } from 'react-dom'
import lzString from 'lz-string'
import uniq from 'lodash/uniq'
import debounce from 'lodash/debounce'
import { Page, Form, colors } from 'tabler-react'
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

  const links = inp
    .split('\n')
    .map(val => val.match(/^(.+) \[([\d.]+)\] (.+)$/))
    .filter(Boolean)
    .filter(val => val[1] !== val[3] && val[2] !== '0')
    .map(([, source, value, target]) => ({
      source,
      value: parseFloat(value),
      target,
    }))

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
          />
        </div>
      ) : null}
    </Page.Content>
  )
}

render(<App />, document.getElementById('root'))