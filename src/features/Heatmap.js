import React, { Component } from 'react'
import uuid from 'uuid'
import moment from 'moment'

import components from '../common/components'

const { Hint } = components

const d3 = window.d3

function convertSvgToPng(callback, width, height) {
  const svgString = new XMLSerializer().serializeToString(document.querySelector('svg'))

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const DOMURL = window.URL || window.webkitURL || window
  const img = new Image()
  const svg = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  const url = DOMURL.createObjectURL(svg)

  img.onload = () => {
    width = width || img.width
    height = height || img.height
    const widthRatio = width / img.width
    const heightRatio = height / img.height
    const pngWidth = img.width * widthRatio
    const pngHeight = img.height * heightRatio
    const x = (width - pngWidth) * 0.5
    const y = (height - pngHeight) * 0.5
    canvas.width = pngWidth
    canvas.height = pngHeight
    ctx.drawImage(img, x, y, pngWidth, pngHeight)
    callback(canvas.toDataURL('image/png'))
  }
  img.src = url
}

function downloadPng() {
  convertSvgToPng((base64) => {
    const a = document.createElement('a');
    a.download = 'heatmap.png';
    a.href = base64;
    a.click();
  })
}

function downloadSvg() {
}

class Heatmap extends Component {
  constructor(props) {
    super(props)

    this.state = {
      dataHistories: JSON.parse(window.localStorage.getItem('dataHistories')) || [],
      svgWidth: 0,
      svgHeight: 0,
    }

    this.addDataHistory = this.addDataHistory.bind(this)
    this.removeDataHistory = this.removeDataHistory.bind(this)
    this.onFileChange = this.onFileChange.bind(this)
    this.renderHeatmap = this.renderHeatmap.bind(this)
  }

  addDataHistory(data) {
    const nextDataHistories = [data, ...this.state.dataHistories]
    window.localStorage.setItem('dataHistories', JSON.stringify(nextDataHistories))
    this.setState({ dataHistories: nextDataHistories })
  }

  removeDataHistory(id) {
    const nextDataHistories = this.state.dataHistories.filter((dataHistory) => dataHistory.id !== id)
    window.localStorage.setItem('dataHistories', JSON.stringify(nextDataHistories))
    this.setState({ dataHistories: nextDataHistories })
  }

  onFileChange(e) {
    const file = e.target.files[0]

    if (file.type !== 'text/csv') {
      // TODO
    }

    const reader = new FileReader()
    reader.onload = (_e) => this.renderHeatmap(_e.target.result, true)
    reader.onerror = (_e) => console.error(_e)
    reader.readAsText(file)
  }

  renderHeatmap(content, saveDataHistory) {
    const width = 1400
    const height = 1400
    const margin = { top: 20, right: 20, bottom: 20, left: 25 }
    const cellSize = 20
    const cellMargin = 2

    if (!content) {
      return
    }
    const rows = content.split('\n')
    if (rows.length < 2) {
      return
    }
    const xHeader = []
    const yHeader = []
    const data = []
    rows.forEach((row, idx) => {
      const cols = row.split(',')
      if (idx === 0) {
        xHeader.push(...cols.slice(1))
      } else {
        yHeader.push(cols[0])
        data.push(...cols.slice(1).map((d) => parseFloat(d)))
      }
    })
    const xNum = xHeader.length
    const yNum = yHeader.length

    margin.left = Math.max(...yHeader.map((head) => head.length)) * 6.25
    margin.top = Math.max(...xHeader.map((head) => head.length)) * 6.25 * 0.9

    const getCellX = (idx) => (idx % xNum) * (cellSize + cellMargin)
    const getCellY = (idx) => parseInt(idx / xNum) * (cellSize + cellMargin)
    const negativeColor = d3.scaleLinear().domain([-1, 0]).range(['red', 'white'])
    const positiveColor = d3.scaleLinear().domain([0, 1]).range(['white', 'blue'])
    const getCellColor = (d) => d > 0 ? positiveColor(d) : negativeColor(d);

    const xAxisScale = d3.scaleBand()
    .domain(xHeader)
    .range([0, (cellSize + cellMargin) * xNum])
    const xAxis = d3.axisTop(xAxisScale)
    const yAxisScale = d3.scaleBand()
    .domain(yHeader)
    .range([0, (cellSize + cellMargin) * yNum])
    const yAxis = d3.axisLeft(yAxisScale)

    const svg = d3.select('.heatmap__svg')
    const heatmap = svg
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('width', width - margin.left - margin.right)
    .attr('height', height - margin.top - margin.bottom)
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

    heatmap.selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('width', cellSize)
    .attr('height', cellSize)
    .attr('x', (d, idx) => getCellX(idx))
    .attr('y', (d, idx) => getCellY(idx))
    .attr('fill', getCellColor)

    svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .attr('class', 'x axis')
    .call(xAxis)
    .selectAll('text')
      .attr('text-anchor', 'start')
      .attr('transform', 'rotate(-45)')

    svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .attr('class', 'y axis')
    .call(yAxis)

    svg.selectAll('.domain')
    .style('display', 'none')

    this.setState({
      svgWidth: xNum * (cellSize + cellMargin) + margin.left + margin.right,
      svgHeight: yNum * (cellSize + cellMargin) + margin.top + margin.bottom,
    })

    if (saveDataHistory) {
      convertSvgToPng((thumbnail) => {
        this.addDataHistory({
          id: uuid.v4(),
          xHeader,
          yHeader,
          data,
          thumbnail,
          updatedAt: moment().from(new Date()),
        })
      }, 110, 110)
    }
  }

  render() {
    const allowFileReader = window.File && window.FileReader && window.FileList && window.Blob;
    const { dataHistories, svgWidth, svgHeight } = this.state

    return (
      <div className="common-wrapper">
        {allowFileReader
          ? (
            <div>
              <div className="heatmap__layout__history">
                <div className="heatmap__history__title">历史记录<Hint tooltip="保存最近20张图片记录"/></div>
                {
                  dataHistories.map((dataHistory) => {
                    const deleteHistory = () => this.removeDataHistory(dataHistory.id)
                    return (
                      <div className="heatmap__history__item" key={dataHistory.id}>
                        <img className="heatmap__history__item__thumbnail common-card" src={dataHistory.thumbnail}/>
                        <div className="heatmap__history__item__date">{dataHistory.updatedAt}</div>
                        <div className="heatmap__history__item__del" onClick={deleteHistory}>&times;</div>
                      </div>
                    )
                  })
                }
                {dataHistories.length === 0 && <div className="heatmap__history__empty">暂无记录</div>}
              </div>
              <div className="heatmap__layout__content">
                <div className="heatmap__utils">
                  <label className="heatmap__utils__file-input common-card" htmlFor="file-input">选择CSV文件</label>
                  <input id="file-input" type="file" onChange={this.onFileChange}/>
                  <button className="heatmap__utils__download common-card" onClick={downloadPng}>下载为PNG</button>
                  <button className="heatmap__utils__download common-card" onClick={downloadSvg}>下载为SVG</button>
                </div>
                <svg width={svgWidth} height={svgHeight} className={'heatmap__svg' + (dataHistories.length > 0 ? '' : ' hidden')}/>
              </div>
            </div>
          )
          : (
          <div className="heatmap__not-allow__overlay">
            <div className="heatmap__not-allow__content">不支持您的浏览器</div>
          </div>
        )}
      </div>
    )
  }
}

export default Heatmap
