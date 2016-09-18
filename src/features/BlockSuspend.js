/* eslint-disable no-invalid-this */

import React, { Component } from 'react'

class BlockSuspend extends Component {
  constructor(props) {
    super(props)

    this.onFileChange = this.onFileChange.bind(this)
    this.extractInfo = this.extractInfo.bind(this)
  }

  extractInfo(content) {
    if (!content) {
      return
    }

    const data = [];
    const rows = content.split('\n')

    rows[0].split(',').forEach((id, idx) => {
      if (idx < 2) {
        return
      }
      data.push({
        id: id.replace('\n', ''),
        name: '',
        interval: null,
        intervals: [],
      })
    })

    rows[1].split(',').forEach((name, idx) => {
      if (idx < 2) {
        return
      }
      data[idx - 2].name = name.replace('\n', '')
    })

    let maxCount = 0
    for (let i = 2; i < rows.length; i++) {
      const cols = rows[i].split(',')
      for (let j = 2; j < cols.length; j++) {
        const t = data[j - 2]
        if (cols[j].match(/0/)) {
          if (t.interval && t.interval.length >= 5) {
            t.intervals.push(t.interval)
            maxCount = Math.max(maxCount, t.intervals.length)
          }
          t.interval = null
        } else {
          t.interval = t.interval || {
            length: 0,
            startDay: cols[1],
            endDay: cols[1],
          }
          t.interval.length++
          t.interval.endDay = cols[1]
        }
      }
    }

    data.forEach((t) => {
      if (t.interval && t.interval.length >= 5) {
        t.intervals.push(t.interval)
        t.interval = null
      }
    })

    let csvContent = ''
    csvContent += ',,'
    for (let i = 1; i <= maxCount; i++) {
      csvContent += `第${i}次停牌,,,`
    }
    csvContent += '\n代码,证券名称,'
    for (let i = 1; i <= maxCount; i++) {
      csvContent += '停牌天数,停牌首日,停牌末日,'
    }
    csvContent += '\n'
    data.forEach((t) => {
      if (t.intervals.length <= 0) {
        return
      }
      csvContent += `${t.id},${t.name},`
      t.intervals.forEach((interval) => {
        csvContent += `${interval.length},${interval.startDay},${interval.endDay},`
      })
      csvContent += '\n'
    })

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'dyy_result.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  onFileChange(e) {
    const file = e.target.files[0]

    const reader = new FileReader()
    reader.onload = (_e) => this.extractInfo(_e.target.result)
    reader.onerror = (_e) => console.error(_e)
    reader.readAsText(file)
  }

  render() {
    const allowFileReader = window.File && window.FileReader && window.FileList && window.Blob;

    return (
      <div className="common-wrapper">
        {allowFileReader
          ? (
            <div>
              <div className="heatmap__utils">
                <label className="heatmap__utils__file-input common-card" htmlFor="file-input">选择CSV文件</label>
                <input id="file-input" type="file" onChange={this.onFileChange}/>
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

export default BlockSuspend
