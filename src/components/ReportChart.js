import React, { useState, useEffect } from 'react'
import moment from 'moment'
import dynamic from 'next/dynamic'

export default function ReportChart({ data, report }) {
  const [period, setPeriod] = useState([])
  const [entries, setEntries] = useState([])
  const [series, setSeries] = useState([])
  const [loading, setLoading] = useState(false)

  const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

  // create a function that takes status string and return integer 0, 1, 2
  // example: "Absent" => 0, "LATE" => 1, "INSUFFICIENT" => 2, "EARLY OUT" => 4
  const getStatus = (status) => {
    if (status === 'ABS') {
      return 0
    } else if (status === 'LATE') {
      return 1
    } else if (status === 'INSUFFICIENT') {
      return 2
    } else if (status === 'EARLY OUT') {
      return 4
    }
  }

  // a function that take a date object formatted in ""

  // create a function that initialize seires of heatmap data from data where each object contain a key "name" that is the employee name and "data" that contains an array of objects with key "x" that is the date object {Fri Sep 01 2023 00:00:00 GMT+0800 (Malaysia Time) {}} converted to "dd" in string and "y" that is the status
  const initializeEntries = () => {
    var temp = data.map((employee) => {
      const employeeName = employee.employeeName
      const employeeData = employee.entries.map((entry) => {
        //convert date from "dd/mm/yyyy" to "dd"
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
    setEntries(temp)
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
            {
              from: 4,
              to: 4,
              name: 'EARLY OUT',
              color: '#FFFF00',
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

  // create function that takes series and fill absent dates up till end of period with status 3
  // example: [{name: "employee1", data: [{x: "09", y: 0}, {x: "14", y: 1}, {x: "27", y: 2}]}] => [{name: "employee1", data: [{x: "09", y: 0}, {x: "10", y: 3}, {x: "11", y: 3}, {x: "12", y: 3}, {x: "13", y: 3}, {x: "14", y: 1}, {x: "15", y: 3}, {x: "16", y: 3}, {x: "17", y: 3}, {x: "18", y: 3}, {x: "19", y: 3}, {x: "20", y: 3}, {x: "21", y: 3}, {x: "22", y: 3}, {x: "23", y: 3}, {x: "24", y: 3}, {x: "25", y: 3}, {x: "26", y: 3}, {x: "27", y: 2}, {x: "28", y: 3}, {x: "29", y: 3}, {x: "30", y: 3}, {x: "31", y: 3}]}]
  const fillPresent = () => {
    const temp = entries.map((employee) => {
      const employeeData = employee.data
      const employeeName = employee.name
      const tempData = []
      for (let i = 0; i < period.length; i++) {
        const date = period[i]
        const found = employeeData.find((element) => element.x === date)
        console.log(found)
        if (found) {
          tempData.push(found)
        } else {
          tempData.push({
            x: date,
            y: 3,
          })
        }
      }
      return {
        name: employeeName,
        data: tempData,
      }
    })
    setSeries(temp)
    setLoading(false)
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
    return dateArray
  }

  // useeffect to init getDates() and set it to period
  useEffect(() => {
    setLoading(true)
    setPeriod(getDates())
    initializeEntries()
  }, [])

  // useeffect to fill absent after period is set
  useEffect(() => {
    if (entries.length > 0) {
      fillPresent()
    }
  }, [entries])

  return (
    <div>
      <h1>Report Chart</h1>
      {loading ? (
        <div>Loading</div>
      ) : series.length > 0 ? (
        <div>
          <Chart
            options={options}
            series={series}
            type='heatmap'
            width={500}
            height={1000}
          />
        </div>
      ) : (
        <div>no data</div>
      )}
    </div>
  )
}
