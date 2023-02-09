import Head from 'next/head'
import styles from '../../styles/Home.module.css'
import React, { useState, useEffect } from 'react'

import { read, utils } from 'xlsx'

import ReportChart from '../components/ReportChart'

export default function Home() {
  const [report, setReport] = useState({
    companyName: '',
    title: '',
    period: '',
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [rawList, setRawList] = useState([]) // array of entries
  const [employeeRawArray, setEmployeeRawArray] = useState([]) // array of employees
  const [employeeArray, setEmployeeArray] = useState([]) // array of employees
  const [loading, setLoading] = useState(false)

  // read the uploaded file into rawList using xlsx library without headers with cellDates set to true
  const readFile = () => {
    const fileReader = new FileReader()
    fileReader.readAsArrayBuffer(selectedFile)
    fileReader.onload = (e) => {
      const bufferArray = e.target.result
      const wb = read(bufferArray, {
        type: 'binary',
        cellDates: true,
        dateNF: 'dd/mm/yyyy',
      })
      const wsname = wb.SheetNames[0]
      const ws = wb.Sheets[wsname]
      const data = utils.sheet_to_json(ws, { header: 1 })
      setRawList(data)
    }
  }

  // read rawList if not null index of 0. the item of index 0 will be the company name, index 1 will be the title, index 2 will be the period
  const readReport = () => {
    const tempArray = rawList[0]
    if (tempArray) {
      const newReport = {
        companyName: tempArray[0],
        title: tempArray[1],
        period: tempArray[5],
      }
      setReport(newReport)
    }
  }

  // loop rawList and group by every entry at index 18 (employee name), then push into employeeArray
  const groupByEmployee = () => {
    const tempArray = []
    rawList.forEach((entry) => {
      const employeeName = entry[18]
      const employeeIndex = tempArray.findIndex(
        (employee) => employee.employeeName === employeeName
      )
      if (employeeIndex === -1) {
        tempArray.push({
          employeeName: employeeName,
          entries: [entry],
        })
      } else {
        tempArray[employeeIndex].entries.push(entry)
      }
    })
    setEmployeeRawArray(tempArray)
  }

  // loop through employeeRawArray and in each entry, map index 23 to "date", index 25 to "in", index"26 to "out", index 27 to "late", index 28 to "early", index 29 to "status" back into its array of objects
  const mapEntries = () => {
    const tempArray = []
    employeeRawArray.forEach((employee) => {
      const tempEmployee = {
        employeeName: employee.employeeName,
        entries: [],
      }
      employee.entries.forEach((entry) => {
        tempEmployee.entries.push({
          date: entry[23],
          in: entry[25],
          out: entry[26],
          late: entry[27],
          early: entry[28],
          status: entry[29],
        })
      })
      tempArray.push(tempEmployee)
    })
    console.log(tempArray)
    setEmployeeArray(tempArray)
  }

  // read the file when selectedFile changes
  useEffect(() => {
    if (selectedFile) {
      setLoading(true)
      readFile()
    }
  }, [selectedFile])

  // read report if rawList length is not 0
  useEffect(() => {
    if (rawList.length !== 0) {
      readReport()
      groupByEmployee()
    }
  }, [rawList])

  useEffect(() => {
    if (employeeRawArray.length !== 0) {
      mapEntries()
    }

    setLoading(false)
  }, [employeeRawArray])

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to{' '}
          <a href='https://nextjs.org'>
            InfoTech Attendance Problem Beautifier!
          </a>
        </h1>
        <p className={styles.description}>
          Get started by uploading{' '}
          <code className={styles.code}>Attendance Problem Report.csv</code>
        </p>
        <input
          type='file'
          accept='.csv'
          onChange={(e) => setSelectedFile(e.target.files[0])}
        />
        <div>
          <h1>{report.companyName}</h1>
          <h2>{report.title}</h2>
          <h3>{report.period}</h3>
        </div>

        {loading && <h1>Loading...</h1>}
        {!loading && employeeArray.length > 0 && (
          <ReportChart data={employeeArray} report={report} />
        )}
      </main>

      <footer className={styles.footer}>
        <a href='https://next.new' target='_blank' rel='noopener noreferrer'>
          Created with&nbsp;<b>next.new</b>&nbsp;⚡️ by Thomas Tan 2023
        </a>
      </footer>
    </div>
  )
}
