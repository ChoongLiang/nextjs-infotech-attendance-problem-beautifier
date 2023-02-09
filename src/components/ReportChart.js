import React, { useState, useEffect } from 'react'
import moment from 'moment'
import dynamic from 'next/dynamic'

export default function ReportChart({ data, report }) {
  const [period, setPeriod] = useState([])
  const [series, setSeries] = useState([])

  const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

  // create a function that takes status string and return integer 0, 1, 2
  // example: "Absent" => 0, "LATE" => 1, "INSUFFICIENT" => 2
  const getStatus = (status) => {
    if (status === 'ABS') {
      return 0
    } else if (status === 'LATE') {
      return 1
    } else if (status === 'INSUFFICIENT') {
      return 2
    }
  }

  // create a function that initialize seires of heatmap data from data where each object contain a key "name" that is the employee name and "data" that contains an array of objects with key "x" that is the date object {Fri Sep 01 2023 00:00:00 GMT+0800 (Malaysia Time) {}} converted to "dd" in string and "y" that is the status
  const initializeSeries = () => {
    var temp = data.map((employee) => {
      const employeeName = employee.employeeName
      const employeeData = employee.entries.map((entry) => {
        const date = moment(entry.date).format('DD')
        const status = getStatus(entry.status)
        return {
          x: date,
          y: status,
        }
      })
      return {
        name: employeeName,
        data: employeeData,
      }
    })
    setSeries(temp)
  }

  const options = {
    chart: {
      height: 3500,
      type: 'heatmap',
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      heatmap: {
        colorScale: {
          ranges: [
            {
              from: 0,
              to: 0,
              name: 'Absent',
              color: '#FF0000',
            },
            {
              from: 1,
              to: 1,
              name: 'LATE',
              color: '#A020F0',
            },
            {
              from: 2,
              to: 2,
              name: 'INSUFFICIENT',
              color: '#0000FF',
            },
            {
              from: 3,
              to: 3,
              name: 'PRESENT',
              color: '#00FF00',
            },
          ],
        },
      },
    },

    title: {
      text: 'Report Chart',
    },
    xaxis: {
      categories: period,
    },
  }

  // create function that loops series and make sure each entry.data contains all dates in period, if not, add it with status 3
  function fillPresent() {
    const temp = series.map((employee) => {
      const employeeName = employee.name
      const employeeData = employee.data
      const tempData = []
      period.forEach((date) => {
        // check if employeeData contains date
        const found = employeeData.find((element) => element.x === date)
        if (found) {
          tempData.push(found)
        } else {
          tempData.push({
            x: date,
            y: 3,
          })
        }
      })
      return {
        name: employeeName,
        data: tempData,
      }
    })
    return temp
  }

  //create function that takes report.period, "09-01-2023 To 31-01-2023" split by "To" then read first two string of split array and return
  // an array of dates converted to "dd" in string from the first string to the second string
  // example: "09-01-2023 To 31-01-2023" => ["09-01-2023", "31-01-2023"] => ["09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"] => ["09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"]
  function getDates() {
    const dates = report.period.split(' To ')
    const startDate = moment(dates[0], 'DD-MM-YYYY')
    const endDate = moment(dates[1], 'DD-MM-YYYY')
    const dateArray = []
    const currentDate = moment(startDate)
    while (currentDate <= endDate) {
      dateArray.push(currentDate.format('DD'))
      currentDate.add(1, 'days')
    }
    console.log(dateArray)
    return dateArray
  }

  // useeffect to init getDates() and set it to period
  useEffect(() => {
    setPeriod(getDates())
    initializeSeries()
  }, [])

  // useeffect to fill absent after period is set
  useEffect(() => {
    if (period.length > 0 && series.length > 0) {
      setSeries(fillPresent())
    }
  }, [period])

  return (
    <div>
      <h1>Report Chart</h1>
      <Chart
        options={options}
        series={series}
        type='heatmap'
        height={1000}
        width={800}
      />
    </div>
  )
}
